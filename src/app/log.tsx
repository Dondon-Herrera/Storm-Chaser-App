import { Image } from 'expo-image';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function StormLogScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const insets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };
    const theme = useTheme();

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
                    Capture storm observations, photos, and notes in one place.
                </ThemedText>

                <ThemedView type="backgroundElement" style={styles.badge}>
                    <ThemedText type="smallBold">Ready for your first storm report</ThemedText>
                </ThemedView>

                <ThemedView type="backgroundElement" style={styles.reportCard}>
                    <ThemedText type="strong">No reports yet</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.cardText}>
                        When you document storms, entries will appear here with location, weather, and notes.
                    </ThemedText>
                    <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                        <ThemedText type="link">Start documenting</ThemedText>
                    </Pressable>
                </ThemedView>

                {Platform.OS === 'web' && (
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
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.two,
        borderRadius: Spacing.five,
    },
    reportCard: {
        gap: Spacing.three,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    cardText: {
        marginTop: Spacing.one,
    },
    button: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
        borderRadius: Spacing.five,
    },
    buttonPressed: {
        opacity: 0.75,
    },
    placeholderImage: {
        width: '100%',
        aspectRatio: 1.8,
        borderRadius: Spacing.four,
        marginTop: Spacing.four,
    },
});
