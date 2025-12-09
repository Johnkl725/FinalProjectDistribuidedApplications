import { useEffect, useState } from "react";
import { renewalsAPI } from "../../services/api";
import { format } from "date-fns";

export default function ExpiringPolicies() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await renewalsAPI.getExpiring(30);
      setItems(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || "No se pudieron cargar las pólizas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sendReminder = async (policyId) => {
    try {
      setRefreshing(true);
      await renewalsAPI.notifyPolicy(policyId);
      await load();
      alert("Recordatorio enviado");
    } catch (err) {
      alert(err?.response?.data?.error || "No se pudo enviar el recordatorio");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Pólizas próximas a vencer (≤ 30 días)
          </h2>
          <p className="text-sm text-gray-500">
            Envío manual de recordatorios y visibilidad para staff/admin.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={loading}
          >
            Refrescar
          </button>
          <button
            onClick={async () => {
              try {
                setRefreshing(true);
                await renewalsAPI.runSweep();
                await load();
              } catch (err) {
                alert("No se pudo ejecutar el barrido");
              } finally {
                setRefreshing(false);
              }
            }}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-60"
            disabled={refreshing}
          >
            Ejecutar barrido
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      {loading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No hay pólizas próximas a vencer.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Póliza
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Vence
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Días
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Pendientes
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.policy.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{item.policy.policy_number}</div>
                    <div className="text-gray-500">Status: {item.policy.status}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{item.policy.first_name} {item.policy.last_name}</div>
                    <div className="text-gray-500 text-xs">{item.policy.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.policy.insurance_type_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {format(new Date(item.expiryDate), "yyyy-MM-dd")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.daysToExpiry} días
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.pendingReminders?.length
                      ? item.pendingReminders.join(", ") + " días"
                      : "Sin pendientes"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => sendReminder(item.policy.id)}
                      className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                      disabled={refreshing}
                    >
                      Enviar recordatorio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

