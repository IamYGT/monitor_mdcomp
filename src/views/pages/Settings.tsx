import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppContext } from '../../viewmodels/contexts/AppContext';
import { ServerSettings } from '../../models/interfaces/MarketData';
import { useLogger } from '../../viewmodels/hooks/useLogger';

const Settings: React.FC = () => {
    const { state, toggleDebugMode } = useAppContext();
    const { addLog } = useLogger();

    // Örnek ayarlar (gerçekte bu değerler sunucudan alınacak)
    const [settings, setSettings] = useState<ServerSettings>({
        cacheSizeLimit: 100,
        cacheTTL: 3600,
        wsPort: 8080,
        logLevel: "info",
        autoReconnect: true
    });

    // Form state'i
    const [formValues, setFormValues] = useState(settings);

    // Form değişikliklerini işleme
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Input tipine göre değer dönüşümü
        let parsedValue: string | number | boolean = value;

        if (type === 'number') {
            parsedValue = parseInt(value, 10);
        } else if (type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        }

        setFormValues(prev => ({
            ...prev,
            [name]: parsedValue
        }));
    };

    // Form gönderme
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Form değerlerini kaydet (gerçekte bir API çağrısı yapılacak)
        setSettings(formValues);
        addLog("Ayarlar başarıyla güncellendi", "success");

        // Debug modu için bir log ekleyelim
        if (state.connection.debugMode) {
            addLog(`Ayarlar güncellendi: ${JSON.stringify(formValues, null, 2)}`, "info");
        }
    };

    // Ayarları sıfırla
    const handleReset = () => {
        setFormValues(settings);
        addLog("Ayarlar varsayılan değerlere sıfırlandı", "warning");
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-emerald-500 mb-2">Sistem Ayarları</h1>
                <p className="text-gray-400">
                    Uygulama ve sunucu ayarlarını yapılandırın.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card title="Genel Ayarlar">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Önbellek Boyutu */}
                                <div>
                                    <label htmlFor="cacheSizeLimit" className="block text-gray-400 text-sm mb-2">
                                        Önbellek Boyut Limiti (MB)
                                    </label>
                                    <input
                                        id="cacheSizeLimit"
                                        name="cacheSizeLimit"
                                        type="number"
                                        min="10"
                                        max="1000"
                                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                                        value={formValues.cacheSizeLimit}
                                        onChange={handleChange}
                                    />
                                    <p className="text-gray-500 text-xs mt-1">
                                        Önbellek için ayrılacak maksimum bellek miktarı
                                    </p>
                                </div>

                                {/* Önbellek TTL */}
                                <div>
                                    <label htmlFor="cacheTTL" className="block text-gray-400 text-sm mb-2">
                                        Önbellek Yaşam Süresi (saniye)
                                    </label>
                                    <input
                                        id="cacheTTL"
                                        name="cacheTTL"
                                        type="number"
                                        min="60"
                                        max="86400"
                                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                                        value={formValues.cacheTTL}
                                        onChange={handleChange}
                                    />
                                    <p className="text-gray-500 text-xs mt-1">
                                        Verilerin önbellekte ne kadar süre tutulacağı
                                    </p>
                                </div>

                                {/* WebSocket Port */}
                                <div>
                                    <label htmlFor="wsPort" className="block text-gray-400 text-sm mb-2">
                                        WebSocket Port
                                    </label>
                                    <input
                                        id="wsPort"
                                        name="wsPort"
                                        type="number"
                                        min="1024"
                                        max="65535"
                                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                                        value={formValues.wsPort}
                                        onChange={handleChange}
                                    />
                                    <p className="text-gray-500 text-xs mt-1">
                                        WebSocket sunucusunun dinleyeceği port
                                    </p>
                                </div>

                                {/* Log Seviyesi */}
                                <div>
                                    <label htmlFor="logLevel" className="block text-gray-400 text-sm mb-2">
                                        Log Seviyesi
                                    </label>
                                    <select
                                        id="logLevel"
                                        name="logLevel"
                                        aria-label="Log seviyesi seçimi"
                                        className="bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-2 w-full focus:ring-emerald-500 focus:border-emerald-500"
                                        value={formValues.logLevel}
                                        onChange={handleChange}
                                    >
                                        <option value="error">Hata</option>
                                        <option value="warn">Uyarı</option>
                                        <option value="info">Bilgi</option>
                                        <option value="debug">Debug</option>
                                    </select>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Hangi log seviyesindeki mesajların kaydedileceği
                                    </p>
                                </div>

                                {/* Otomatik Yeniden Bağlanma */}
                                <div className="flex items-center space-x-3">
                                    <input
                                        id="autoReconnect"
                                        name="autoReconnect"
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-900"
                                        checked={formValues.autoReconnect}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="autoReconnect" className="text-gray-300">
                                        Otomatik Yeniden Bağlanma
                                    </label>
                                </div>

                                {/* Butonlar */}
                                <div className="flex justify-end space-x-3 mt-8">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleReset}
                                    >
                                        Sıfırla
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        icon={<i className="bi bi-check-lg"></i>}
                                    >
                                        Kaydet
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>

                <div>
                    <Card title="Debug Modu">
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm">
                                Debug modu, geliştiricilerin sorunu teşhis etmelerine yardımcı olmak için daha ayrıntılı loglar oluşturur ve gösterir.
                            </p>

                            <div className={`p-3 rounded-lg text-sm ${state.connection.debugMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-700 text-gray-300'}`}>
                                <div className="flex items-center justify-between">
                                    <span>Debug Modu</span>
                                    <span className="font-semibold">{state.connection.debugMode ? 'Aktif' : 'Kapalı'}</span>
                                </div>
                            </div>

                            <Button
                                variant={state.connection.debugMode ? 'outline' : 'primary'}
                                fullWidth
                                onClick={toggleDebugMode}
                                icon={<i className="bi bi-bug"></i>}
                            >
                                {state.connection.debugMode ? 'Debug Modunu Kapat' : 'Debug Modunu Aç'}
                            </Button>

                            {state.connection.debugMode && (
                                <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg text-sm">
                                    <i className="bi bi-exclamation-triangle mr-2"></i>
                                    Debug modu aktif olduğunda uygulama performansı etkilenebilir.
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="Sistem Bilgisi" className="mt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Versiyon:</span>
                                <span className="text-emerald-500 font-mono">1.0.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Son Güncelleme:</span>
                                <span className="text-emerald-500">15.10.2023</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">WebSocket API:</span>
                                <span className="text-emerald-500">v2.1</span>
                            </div>

                            <div className="bg-gray-900/50 p-3 rounded-lg text-sm">
                                <p className="text-gray-400">Bakım Zamanı</p>
                                <p className="text-emerald-500 font-semibold mt-1">Pazartesi, 10:00 - 12:00 UTC</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings; 