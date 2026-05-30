import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { capturePhotoAsync, requestCameraPermissions } from '@/lib/camera';
import { saveStormReport } from '@/lib/storage';
import { fetchWeatherData, getCurrentLocation, requestLocationPermissions } from '@/lib/weather';

export default function NewStormReportScreen() {
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [stormType, setStormType] = useState('');
    const [weatherCondition, setWeatherCondition] = useState('');
    const [notes, setNotes] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [dateTime, setDateTime] = useState(new Date().toISOString());
    const [temperature, setTemperature] = useState<number | null>(null);
    const [windSpeed, setWindSpeed] = useState<number | null>(null);
    const [precipitationProbability, setPrecipitationProbability] = useState<number | null>(null);
    const [loadingMetadata, setLoadingMetadata] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const router = useRouter();
    const safeAreaInsets = useSafeAreaInsets();
    const insets = {
        top: safeAreaInsets.top,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };
    const theme = useTheme();

    useEffect(() => {
        loadMetadata();
    }, []);

    async function loadMetadata() {
        setLoadingMetadata(true);
        setMessage('Loading location and weather information…');

        try {
            const hasPermission = await requestLocationPermissions();
            if (!hasPermission) {
                setMessage('Allow location access to save location-based storm reports.');
                return;
            }

            const location = await getCurrentLocation();
            if (!location?.coords) {
                setMessage('Could not detect your current position.');
                return;
            }

            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);
            setDateTime(new Date().toISOString());

            const weatherData = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
            setWeatherCondition(weatherData.weatherDescription);
            setTemperature(weatherData.temperature);
            setWindSpeed(weatherData.windSpeed);
            setPrecipitationProbability(weatherData.precipitationProbability);
        } catch (error) {
            console.error(error);
            setMessage('Unable to load weather metadata. You can still save a report manually.');
        } finally {
            setLoadingMetadata(false);
        }
    }

    async function handleCapturePhoto() {
        setMessage('');
        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) {
            setMessage('Camera permission is required to capture storm photos.');
            return;
        }

        const uri = await capturePhotoAsync();
        if (uri) {
            setPhotoUri(uri);
            setMessage('Photo captured. Complete the form to save your report.');
        }
    }

    async function handleSaveReport() {
        setMessage('');

        if (!photoUri) {
            setMessage('Capture a photo before saving the storm report.');
            return;
        }

        if (!stormType.trim()) {
            setMessage('Please enter a storm type or classification.');
            return;
        }

        if (latitude === null || longitude === null) {
            setMessage('Valid location data is required for this report.');
            return;
        }

        if (temperature === null || windSpeed === null) {
            setMessage('Unable to save report without weather metadata.');
            return;
        }

        setSaving(true);

        try {
            await saveStormReport({
                photoUri,
                stormType: stormType.trim(),
                weatherCondition: weatherCondition || 'Unknown',
                notes: notes.trim(),
                latitude,
                longitude,
                dateTime,
                createdAt: new Date().toISOString(),
                temperature,
                windSpeed,
                precipitationProbability,
            });
            router.push('/log');
        } catch (error) {
            console.error(error);
            setMessage('Unable to save the storm report. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    const locationText = latitude !== null && longitude !== null ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Waiting for location';
    const precipitationText = precipitationProbability !== null ? `${precipitationProbability}%` : 'N/A';

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]}
        >
            <ThemedView style={styles.wrapper}>
                <ThemedText type="title" style={styles.title}>
                    New Storm Report
                </ThemedText>
                <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
                    Capture storm evidence, save coordinates, and archive the weather context.
                </ThemedText>

                <ThemedView type="backgroundElement" style={styles.metaCard}>
                    <ThemedText type="smallBold">Report metadata</ThemedText>
                    <ThemedText type="small">Location: {locationText}</ThemedText>
                    <ThemedText type="small">Date & time: {new Date(dateTime).toLocaleString()}</ThemedText>
                    <ThemedText type="small">Current weather: {weatherCondition || 'Loading…'}</ThemedText>
                    <ThemedText type="small">Temp: {temperature !== null ? `${temperature.toFixed(1)}°C` : '—'}</ThemedText>
                    <ThemedText type="small">Wind: {windSpeed !== null ? `${windSpeed.toFixed(0)} km/h` : '—'}</ThemedText>
                    <ThemedText type="small">Rain chance: {precipitationText}</ThemedText>
                </ThemedView>

                <Pressable style={({ pressed }) => [styles.photoButton, pressed && styles.buttonPressed]} onPress={handleCapturePhoto}>
                    <ThemedText type="link">Capture Photo</ThemedText>
                </Pressable>

                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
                ) : (
                    <ThemedView type="backgroundElement" style={styles.photoPlaceholder}>
                        <ThemedText type="smallBold">No photo selected yet</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            Use the camera button above to attach storm evidence.
                        </ThemedText>
                    </ThemedView>
                )}

                <ThemedView type="backgroundElement" style={styles.inputCard}>
                    <ThemedText type="smallBold">Storm type / classification</ThemedText>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        value={stormType}
                        placeholder="e.g. Tornado, Hail, Wind Event"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={setStormType}
                    />
                    <ThemedText type="smallBold">Weather conditions</ThemedText>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        value={weatherCondition}
                        placeholder="Describe observed weather"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={setWeatherCondition}
                    />
                    <ThemedText type="smallBold">Notes / description</ThemedText>
                    <TextInput
                        style={[styles.textArea, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        value={notes}
                        placeholder="Add notes about the storm event"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={setNotes}
                        multiline
                    />
                </ThemedView>

                {message ? <ThemedText type="small" themeColor="textSecondary">{message}</ThemedText> : null}

                <Pressable
                    style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}
                    onPress={handleSaveReport}
                    disabled={saving || loadingMetadata}
                >
                    {saving ? <ActivityIndicator color={theme.text} /> : <ThemedText type="link">Save Report</ThemedText>}
                </Pressable>
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
    metaCard: {
        gap: Spacing.two,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    photoButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
        borderRadius: Spacing.five,
    },
    photoPreview: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: Spacing.four,
    },
    photoPlaceholder: {
        gap: Spacing.two,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    inputCard: {
        gap: Spacing.two,
        padding: Spacing.four,
        borderRadius: Spacing.four,
    },
    input: {
        borderWidth: 1,
        borderRadius: Spacing.four,
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: Spacing.four,
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    saveButton: {
        alignSelf: 'stretch',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.four,
        borderRadius: Spacing.five,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.75,
    },
});
