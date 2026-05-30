import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterChip } from '@/components/ui/filter-chip';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { hapticSuccess } from '@/lib/haptics';
import { navigateTo } from '@/lib/navigation';
import { getStormTypeColor } from '@/lib/storm-intelligence';
import { capturePhotoAsync, requestCameraPermissions } from '@/lib/camera';
import { saveStormReport } from '@/lib/storage';
import { fetchWeatherData, getCurrentLocation, requestLocationPermissions } from '@/lib/weather';

const STORM_PRESETS = ['Supercell', 'Tornado', 'Hail core', 'Downburst', 'Lightning barrage', 'Flooding'];

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
    const theme = useTheme();

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            setMessage('Loading location and weather information…');

            try {
                const hasPermission = await requestLocationPermissions();
                if (cancelled) {
                    return;
                }
                if (!hasPermission) {
                    setMessage('Allow location access to save location-based storm reports.');
                    return;
                }

                const location = await getCurrentLocation();
                if (cancelled) {
                    return;
                }
                if (!location?.coords) {
                    setMessage('Could not detect your current position.');
                    return;
                }

                setLatitude(location.coords.latitude);
                setLongitude(location.coords.longitude);
                setDateTime(new Date().toISOString());

                const weatherData = await fetchWeatherData(
                    location.coords.latitude,
                    location.coords.longitude
                );
                if (cancelled) {
                    return;
                }

                setWeatherCondition(weatherData.weatherDescription);
                setTemperature(weatherData.temperature);
                setWindSpeed(weatherData.windSpeed);
                setPrecipitationProbability(weatherData.precipitationProbability);
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setMessage('Unable to load weather metadata. You can still save a report manually.');
                }
            } finally {
                if (!cancelled) {
                    setLoadingMetadata(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

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
            void hapticSuccess();
            navigateTo(router, '/log');
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
        <ScreenShell>
            <ScreenHeader
                eyebrow="Field capture"
                title="New intercept"
                subtitle="Attach photo evidence, classify the cell, and auto-bind live weather telemetry."
            />

                <Card style={styles.metaCard}>
                    <ThemedText type="smallBold">Report metadata</ThemedText>
                    <ThemedText type="small">Location: {locationText}</ThemedText>
                    <ThemedText type="small">Date & time: {new Date(dateTime).toLocaleString()}</ThemedText>
                    <ThemedText type="small">
                        Current weather: {loadingMetadata ? 'Loading…' : weatherCondition || 'Unavailable'}
                    </ThemedText>
                    <ThemedText type="small">Temp: {temperature !== null ? `${temperature.toFixed(1)}°C` : '—'}</ThemedText>
                    <ThemedText type="small">Wind: {windSpeed !== null ? `${windSpeed.toFixed(0)} km/h` : '—'}</ThemedText>
                    <ThemedText type="small">Rain chance: {precipitationText}</ThemedText>
                </Card>

                <Button title="Capture photo" onPress={handleCapturePhoto} />

                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
                ) : (
                    <Card style={styles.photoPlaceholder}>
                        <ThemedText type="smallBold">No photo selected yet</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            Use the camera button above to attach storm evidence.
                        </ThemedText>
                    </Card>
                )}

                <Card style={styles.inputCard}>
                    <ThemedText type="smallBold">Classification</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
                        {STORM_PRESETS.map((preset) => (
                            <FilterChip
                                key={preset}
                                label={preset}
                                selected={stormType === preset}
                                onPress={() => setStormType(preset)}
                                color={getStormTypeColor(preset)}
                            />
                        ))}
                    </ScrollView>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundElevated }]}
                        value={stormType}
                        placeholder="Custom classification"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={setStormType}
                    />
                    <ThemedText type="smallBold">Weather conditions</ThemedText>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundElevated }]}
                        value={weatherCondition}
                        placeholder="Describe observed weather"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={setWeatherCondition}
                    />
                    <ThemedText type="smallBold">Notes / description</ThemedText>
                    <TextInput
                        style={[styles.textArea, { color: theme.text, borderColor: theme.surfaceBorder, backgroundColor: theme.backgroundElevated }]}
                        value={notes}
                        placeholder="Add notes about the storm event"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={setNotes}
                        multiline
                    />
                </Card>

                {message ? <ThemedText type="small" themeColor="textSecondary">{message}</ThemedText> : null}

                <Button title={saving ? 'Archiving…' : 'Archive intercept'} size="lg" onPress={handleSaveReport} />
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    metaCard: {
        gap: Spacing.two,
    },
    presetRow: {
        gap: Spacing.two,
        paddingVertical: Spacing.one,
    },
    photoPreview: {
        width: '100%',
        height: 220,
        borderRadius: Radii.large,
    },
    photoPlaceholder: {
        gap: Spacing.two,
    },
    inputCard: {
        gap: Spacing.three,
    },
    input: {
        borderWidth: 1,
        borderRadius: Radii.normal,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.three,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: Radii.normal,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.three,
        minHeight: 120,
        textAlignVertical: 'top',
    },
});
