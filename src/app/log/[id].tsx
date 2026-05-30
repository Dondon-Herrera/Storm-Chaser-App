import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteStormReport, getStormReportById, type StormReport } from '@/lib/storage';

export default function StormReportDetailScreen() {
    const { id } = useLocalSearchParams();
    const [report, setReport] = useState<StormReport | null>(null);
    const [loading, setLoading] = useState(true);
    const safeAreaInsets = useSafeAreaInsets();
    const insets = {
        top: safeAreaInsets.top,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };
    const theme = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (typeof id === 'string') {
            loadReport(Number(id));
        }
    }, [id]);

    async function loadReport(reportId: number) {
        setLoading(true);

        try {
            const stored = await getStormReportById(reportId);
            if (!stored) {
                return;
            }
            setReport(stored);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteReport() {
        const reportId = report?.id;
        if (reportId == null) {
            return;
        }

        Alert.alert('Delete report', 'Are you sure you want to remove this storm report?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteStormReport(reportId);
                        router.push('/log');
                    } catch (error) {
                        console.error(error);
                    }
                },
            },
        ]);
    }

    const mapUrl = report
        ? `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`
        : undefined;

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
        >
            <ThemedView style={styles.wrapper}>
                <ThemedText type="title" style={styles.title}>
                    Storm Report Details
                </ThemedText>
                <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
                    Review the storm observation and weather metadata for this saved report.
                </ThemedText>

                {loading ? (
                    <ThemedView type="backgroundElement" style={styles.card}>
                        <ThemedText type="smallBold">Loading report…</ThemedText>
                    </ThemedView>
                ) : report ? (
                    <ThemedView type="backgroundElement" style={styles.card}>
                        <ThemedView type="backgroundElement" style={styles.metaSection}>
                            <ThemedText type="smallBold">Storm type</ThemedText>
                            <ThemedText type="small">{report.stormType}</ThemedText>
                        </ThemedView>

                        <ThemedView type="backgroundElement" style={styles.metaSection}>
                            <ThemedText type="smallBold">Weather condition</ThemedText>
                            <ThemedText type="small">{report.weatherCondition}</ThemedText>
                            <ThemedText type="small">Temp: {report.temperature.toFixed(1)}°C</ThemedText>
                            <ThemedText type="small">Wind: {report.windSpeed.toFixed(0)} km/h</ThemedText>
                            <ThemedText type="small">Rain chance: {report.precipitationProbability ?? 'N/A'}%</ThemedText>
                        </ThemedView>

                        <Image source={{ uri: report.photoUri }} style={styles.image} contentFit="cover" />

                        <ThemedView type="backgroundElement" style={styles.metaSection}>
                            <ThemedText type="smallBold">Notes</ThemedText>
                            <ThemedText type="small">{report.notes || 'No additional notes'}</ThemedText>
                        </ThemedView>

                        <ThemedView type="backgroundElement" style={styles.metaSection}>
                            <ThemedText type="smallBold">Recorded</ThemedText>
                            <ThemedText type="small">{new Date(report.dateTime).toLocaleString()}</ThemedText>
                            <ThemedText type="small">Saved: {new Date(report.createdAt).toLocaleString()}</ThemedText>
                            <ThemedText type="small">Coordinates: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</ThemedText>
                        </ThemedView>

                        <Link href="/log" style={styles.detailLink}>
                            <ThemedText type="link">Return to log</ThemedText>
                        </Link>
                        {mapUrl ? (
                            <Pressable onPress={() => Linking.openURL(mapUrl)} style={styles.detailLink}>
                                <ThemedText type="link">Open in maps</ThemedText>
                            </Pressable>
                        ) : null}
                        <Pressable
                            style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                            onPress={handleDeleteReport}
                        >
                            <ThemedText type="link" style={styles.deleteText}>
                                Delete report
                            </ThemedText>
                        </Pressable>
                    </ThemedView>
                ) : (
                    <ThemedView type="backgroundElement" style={styles.card}>
                        <ThemedText type="smallBold">Report not found</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            That report may have been removed or the link is invalid.
                        </ThemedText>
                        <Link href="/log" style={styles.detailLink}>
                            <ThemedText type="link">Back to logs</ThemedText>
                        </Link>
                    </ThemedView>
                )}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
    },
    wrapper: {
        width: '100%',
        maxWidth: MaxContentWidth,
        gap: Spacing.four,
        paddingHorizontal: Spacing.four,
        paddingBottom: Spacing.four,
    },
    title: {
        textAlign: 'left',
    },
    subtitle: {
        maxWidth: 560,
    },
    card: {
        gap: Spacing.four,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    metaSection: {
        gap: Spacing.one,
    },
    image: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: Spacing.four,
    },
    detailLink: {
        paddingVertical: Spacing.two,
    },
    deleteButton: {
        paddingVertical: Spacing.two,
    },
    deleteText: {
        color: '#e63946',
    },
    buttonPressed: {
        opacity: 0.75,
    },
});
