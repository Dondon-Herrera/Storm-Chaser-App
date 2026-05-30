import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getStormReports, type StormReport } from '@/lib/storage';

function getStaticMapUrl(reports: StormReport[]) {
    if (!reports.length) {
        return null;
    }

    const centerLat = reports.reduce((sum, report) => sum + report.latitude, 0) / reports.length;
    const centerLon = reports.reduce((sum, report) => sum + report.longitude, 0) / reports.length;
    const markers = reports
        .slice(0, 8)
        .map((report) => `${report.latitude.toFixed(5)},${report.longitude.toFixed(5)},red-pushpin`)
        .join('|');

    return `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat.toFixed(5)},${centerLon.toFixed(5)}&zoom=4&size=900x500&maptype=mapnik&markers=${encodeURIComponent(
        markers
    )}`;
}

export default function MapScreen() {
    const [reports, setReports] = useState<StormReport[]>([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();
    const safeAreaInsets = useSafeAreaInsets();
    const insets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };
    const theme = useTheme();

    useEffect(() => {
        if (isFocused) {
            loadReports();
        }
    }, [isFocused]);

    async function loadReports() {
        setLoading(true);
        try {
            const stored = await getStormReports();
            setReports(stored);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const mapUrl = getStaticMapUrl(reports);

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
        >
            <ThemedView style={styles.wrapper}>
                <ThemedText type="title" style={styles.title}>
                    Storm Map
                </ThemedText>
                <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
                    Visualize documented storm locations and jump to reports from the map.
                </ThemedText>

                {loading ? (
                    <ThemedView type="backgroundElement" style={styles.statusCard}>
                        <ActivityIndicator color={theme.text} />
                        <ThemedText type="small" themeColor="textSecondary" style={styles.loadingText}>
                            Loading locations…
                        </ThemedText>
                    </ThemedView>
                ) : reports.length === 0 ? (
                    <ThemedView type="backgroundElement" style={styles.reportCard}>
                        <ThemedText type="smallBold">No storm locations yet</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.cardText}>
                            Create a storm report to see its location mapped here.
                        </ThemedText>
                        <Link href="/log/new">
                            <ThemedText type="link">Add first report</ThemedText>
                        </Link>
                    </ThemedView>
                ) : (
                    <>
                        {mapUrl ? (
                            <Image source={{ uri: mapUrl }} style={styles.mapImage} contentFit="cover" />
                        ) : null}

                        <ThemedView type="backgroundElement" style={styles.summaryCard}>
                            <ThemedText type="smallBold">Saved storm locations</ThemedText>
                            <ThemedText type="small">{reports.length} documented storm events.</ThemedText>
                        </ThemedView>

                        <ThemedView type="backgroundElement" style={styles.reportList}>
                            {reports.map((report) => (
                                <View key={report.id?.toString() ?? report.dateTime} style={styles.reportRow}>
                                    <View style={styles.reportDetails}>
                                        <ThemedText type="smallBold">{report.stormType}</ThemedText>
                                        <ThemedText type="small" themeColor="textSecondary">
                                            {new Date(report.dateTime).toLocaleDateString()} • {report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                    <Link href={`/log/${report.id}`} style={styles.reportLink}>
                                        <ThemedText type="link">View</ThemedText>
                                    </Link>
                                </View>
                            ))}
                        </ThemedView>
                    </>
                )}

                {reports.length === 0 && Platform.OS === 'web' && (
                    <Image
                        source={require('@/assets/images/tutorial-web.png')}
                        style={styles.placeholderImage}
                        contentFit="cover"
                    />
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
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    loadingText: {
        marginLeft: Spacing.two,
    },
    reportCard: {
        gap: Spacing.three,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    cardText: {
        marginTop: Spacing.one,
    },
    mapImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: Spacing.four,
    },
    summaryCard: {
        gap: Spacing.one,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    reportList: {
        gap: Spacing.two,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    reportRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: Spacing.four,
    },
    reportDetails: {
        flex: 1,
    },
    reportLink: {
        paddingVertical: Spacing.two,
    },
    placeholderImage: {
        width: '100%',
        aspectRatio: 1.8,
        borderRadius: Spacing.four,
        marginTop: Spacing.four,
    },
});
