import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getStormReports, type StormReport } from '@/lib/storage';

export default function StormLogScreen() {
    const [reports, setReports] = useState<StormReport[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
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
            const saved = await getStormReports();
            setReports(saved);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
        >
            <ThemedView style={styles.wrapper}>
                <ThemedText type="title" style={styles.title}>
                    Storm Log
                </ThemedText>
                <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
                    Document storm activity with photos, notes, and location metadata.
                </ThemedText>

                <Pressable
                    style={({ pressed }) => [styles.newButton, pressed && styles.buttonPressed]}
                    onPress={() => router.push('/log/new')}
                >
                    <ThemedText type="link">Create new report</ThemedText>
                </Pressable>

                {loading ? (
                    <ThemedView type="backgroundElement" style={styles.statusCard}>
                        <ActivityIndicator color={theme.text} />
                        <ThemedText type="small" themeColor="textSecondary" style={styles.loadingText}>
                            Loading reports…
                        </ThemedText>
                    </ThemedView>
                ) : reports.length === 0 ? (
                    <ThemedView type="backgroundElement" style={styles.reportCard}>
                        <ThemedText type="smallBold">No reports yet</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.cardText}>
                            When you document storms, saved entries will appear here with a quick summary.
                        </ThemedText>
                        <Link href="/log/new">
                            <ThemedText type="link">Start documenting</ThemedText>
                        </Link>
                    </ThemedView>
                ) : (
                    reports.map((report) => (
                        <ThemedView key={report.id?.toString() ?? report.dateTime} type="backgroundElement" style={styles.reportCard}>
                            <View style={styles.reportHeader}>
                                <ThemedText type="smallBold">{report.stormType}</ThemedText>
                                <ThemedText type="small" themeColor="textSecondary">
                                    {new Date(report.dateTime).toLocaleString()}
                                </ThemedText>
                            </View>
                            <ThemedText type="small">{report.weatherCondition}</ThemedText>
                            <ThemedText type="small">Location: {report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}</ThemedText>
                            <Image source={{ uri: report.photoUri }} style={styles.previewImage} contentFit="cover" />
                            <Link href="/log/new">
                                <ThemedText type="link">Add another report</ThemedText>
                            </Link>
                        </ThemedView>
                    ))
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
    newButton: {
        alignSelf: 'flex-start',
        borderRadius: Spacing.five,
    },
    linkButton: {
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
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
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    previewImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: Spacing.four,
    },
    placeholderImage: {
        width: '100%',
        aspectRatio: 1.8,
        borderRadius: Spacing.four,
        marginTop: Spacing.four,
    },
});
