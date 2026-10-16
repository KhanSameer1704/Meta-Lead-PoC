
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io } from 'socket.io-client';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const SERVER_URL = 'http://10.20.0.2:5001';

type Lead = {
  id: string;
  name?: string;
  email?: string;
  source?: string;
  createdAt?: string;
  event?: unknown;
};

export default function HomeScreen() {
  const [connected, setConnected] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
    });

    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message);
      setConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    socket.on('new-lead', (lead: Lead) => {
      console.log('New lead received:', lead);

      const normalizedLead: Lead = {
        ...lead,
        id: lead.id || Date.now().toString(),
        source: lead.source || 'Meta Lead Ads',
        createdAt: lead.createdAt || new Date().toISOString(),
      };

      setLeads((previousLeads) => [
        normalizedLead,
        ...previousLeads,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Meta Leads</ThemedText>

          <ThemedText type="small">
            Status: {connected ? 'Connected' : 'Connecting...'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText type="title">Incoming Leads</ThemedText>

          <FlatList
            data={leads}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedView style={styles.emptyState}>
                <ThemedText type="title">
                  No leads received yet
                </ThemedText>

                <ThemedText type="small">
                  New test leads will appear here automatically.
                </ThemedText>
              </ThemedView>
            }
            renderItem={({ item }) => (
              <ThemedView style={styles.leadCard}>
                <ThemedText type="subtitle">
                  {item.name || 'Meta lead event'}
                </ThemedText>

                <ThemedText>
                  {item.email || 'Lead details not retrieved yet'}
                </ThemedText>

                <ThemedText type="small">
                  Source: {item.source || 'Unknown'}
                </ThemedText>

                {item.createdAt ? (
                  <ThemedText type="small">
                    Received: {new Date(item.createdAt).toLocaleString()}
                  </ThemedText>
                ) : null}

                {item.event ? (
                  <ThemedText type="small">
                    Meta event received successfully.
                  </ThemedText>
                ) : null}
              </ThemedView>
            )}
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    padding: Spacing.four,
    borderRadius: 12,
    gap: Spacing.two,
  },
  content: {
    flex: 1,
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  list: {
    gap: Spacing.three,
    flexGrow: 1,
  },
  emptyState: {
    padding: Spacing.four,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    minHeight: 160,
  },
  leadCard: {
    padding: Spacing.four,
    borderRadius: 12,
    gap: Spacing.two,
  },
});
