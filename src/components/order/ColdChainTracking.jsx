import { useState, useEffect } from "react";
import {
  CubeIcon, // Replaced ThermometerIcon
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ColdChainTracking({ hasColdChainItems }) {
  const [temperatureData, setTemperatureData] = useState([]);
  const [currentTemp, setCurrentTemp] = useState(null);

  useEffect(() => {
    if (!hasColdChainItems) return;

    // Simulate temperature monitoring
    const interval = setInterval(() => {
      const temp = 2 + Math.random() * 6; // 2-8°C range
      const timestamp = new Date();

      setCurrentTemp(temp);
      setTemperatureData((prev) => [...prev.slice(-10), { temp, timestamp }]);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [hasColdChainItems]);

  if (!hasColdChainItems) return null;

  const isTemperatureOk = currentTemp >= 2 && currentTemp <= 8;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center mb-4">
        <ThermometerIcon className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold">Cold Chain Monitoring</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Temperature */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Current Temperature
            </span>
            {!isTemperatureOk && (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div
            className={`text-3xl font-bold ${
              isTemperatureOk ? "text-green-600" : "text-red-600"
            }`}
          >
            {currentTemp ? `${currentTemp.toFixed(1)}°C` : "--"}
          </div>
          <div className="text-sm text-gray-500 mt-1">Target: 2-8°C</div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Cold Chain Status
          </div>
          <div
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              isTemperatureOk
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isTemperatureOk ? "✓ Maintained" : "⚠ Alert"}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Temperature History */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3">
          Temperature History
        </h4>
        <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-end space-x-1">
          {temperatureData.map((data, index) => (
            <div
              key={index}
              className={`flex-1 rounded-t ${
                data.temp >= 2 && data.temp <= 8 ? "bg-green-400" : "bg-red-400"
              }`}
              style={{ height: `${(data.temp / 10) * 100}%` }}
              title={`${data.temp.toFixed(
                1
              )}°C at ${data.timestamp.toLocaleTimeString()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10 readings ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Alerts */}
      {!isTemperatureOk && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h4 className="font-medium text-red-800">Temperature Alert</h4>
              <p className="text-sm text-red-700">
                Temperature is outside the safe range. Our team has been
                notified.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>• Cold chain items require temperature control during transport</p>
        <p>• Temperature is monitored continuously during delivery</p>
        <p>• Items will be replaced if temperature requirements are not met</p>
      </div>
    </div>
  );
}
