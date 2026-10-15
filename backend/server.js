
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Meta Leads backend is running',
  });
});

// Meta webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (
    mode === 'subscribe' &&
    process.env.META_VERIFY_TOKEN &&
    token === process.env.META_VERIFY_TOKEN
  ) {
    console.log('Meta webhook verified');
    return res.status(200).send(String(challenge ?? ''));
  }

  console.log('Meta webhook verification failed');
  return res.sendStatus(403);
});

// Retrieve actual lead details from Meta Graph API
async function fetchMetaLead(leadId) {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  const version = process.env.META_API_VERSION || 'v26.0';

  if (!token) {
    throw new Error('META_PAGE_ACCESS_TOKEN is missing in .env');
  }

  const url = new URL(
    `https://graph.facebook.com/${version}/${encodeURIComponent(leadId)}`
  );

  url.searchParams.set(
    'fields',
    'id,created_time,form_id,field_data'
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Meta Graph API error (${response.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

// Convert Meta's field_data into a mobile-friendly lead
function formatLead(data, fallbackFormId) {
  const fields = data.field_data || [];

  const getField = (...names) => {
    const field = fields.find((item) => names.includes(item.name));
    return field?.values?.[0] || '';
  };

  return {
    id: String(data.id),
    name: getField('full_name', 'name'),
    email: getField('email'),
    phone: getField('phone_number', 'phone'),
    source: 'Meta Lead Ads',
    createdAt: data.created_time || new Date().toISOString(),
    formId: data.form_id || fallbackFormId || '',
    fieldData: fields,
  };
}

// Receive Meta webhook events
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Respond immediately so Meta does not keep retrying the notification.
  res.sendStatus(200);

  if (body?.object !== 'page') {
    console.log('Ignoring non-Page webhook event');
    return;
  }

  // Process asynchronously after acknowledging Meta.
  void (async () => {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen') continue;

        const value = change.value || {};
        const leadId = value.leadgen_id;

        if (!leadId) {
          console.warn('leadgen event did not contain leadgen_id');
          continue;
        }

        try {
          console.log('Fetching Meta lead:', leadId);

          const data = await fetchMetaLead(leadId);
          const lead = formatLead(data, value.form_id);

          io.emit('new-lead', lead);

          console.log('Retrieved and emitted lead:', lead.id);
        } catch (error) {
          console.error(
            'Unable to retrieve Meta lead:',
            error.message
          );
        }
      }
    }
  })();
});

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Test endpoint: simulate a lead without contacting Meta
app.post('/test-lead', (req, res) => {
  const lead = {
    id: Date.now().toString(),
    name: 'Test Lead',
    email: 'test@example.com',
    phone: '',
    source: 'Mock Meta Lead',
    createdAt: new Date().toISOString(),
  };

  io.emit('new-lead', lead);

  return res.status(200).json({
    status: 'success',
    message: 'Mock lead sent to connected clients',
    lead,
  });
});

// Handle startup errors
httpServer.on('error', (error) => {
  console.error('Server startup error:', error.message);

  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the other server first.`
    );
  }

  process.exitCode = 1;
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
