-- ===============================================
-- SCRIPT: Crear Pólizas de Prueba para Empleados
-- ===============================================

-- Este script crea pólizas con status 'issued' (pendientes de aprobación)
-- para que los empleados puedan verlas y aprobarlas

-- Póliza de Vida Pendiente
INSERT INTO policies (
  policy_number,
  user_id,
  insurance_type_id,
  status,
  start_date,
  premium_amount,
  coverage_amount,
  life_details,
  is_current
) VALUES (
  'LIFE-' || LPAD(NEXTVAL('policies_id_seq')::TEXT, 12, '0'),
  (SELECT id FROM users WHERE email = 'john.doe@email.com' LIMIT 1),
  (SELECT id FROM insurance_types WHERE name = 'life'),
  'issued',  -- Pendiente de aprobación
  CURRENT_DATE,
  150.00,
  500000.00,
  '{"age": 35, "smoker": false, "medical_history": "Ninguna", "beneficiaries": [{"name": "Jane Doe", "relationship": "Esposa", "percentage": 100}]}'::jsonb,
  true
);

-- Póliza de Vehículo Pendiente
INSERT INTO policies (
  policy_number,
  user_id,
  insurance_type_id,
  status,
  start_date,
  premium_amount,
  coverage_amount,
  vehicle_details,
  is_current
) VALUES (
  'VEH-' || LPAD(NEXTVAL('policies_id_seq')::TEXT, 12, '0'),
  (SELECT id FROM users WHERE email = 'jane.smith@email.com' LIMIT 1),
  (SELECT id FROM insurance_types WHERE name = 'vehicle'),
  'issued',  -- Pendiente de aprobación
  CURRENT_DATE,
  95.00,
  75000.00,
  '{"make": "Toyota", "model": "Corolla", "year": 2023, "license_plate": "ABC-123", "vin": "1HGBH41JXMN109186"}'::jsonb,
  true
);

-- Póliza de Renta Pendiente
INSERT INTO policies (
  policy_number,
  user_id,
  insurance_type_id,
  status,
  start_date,
  premium_amount,
  coverage_amount,
  rent_details,
  is_current
) VALUES (
  'RENT-' || LPAD(NEXTVAL('policies_id_seq')::TEXT, 12, '0'),
  (SELECT id FROM users WHERE email = 'john.doe@email.com' LIMIT 1),
  (SELECT id FROM insurance_types WHERE name = 'rent'),
  'issued',  -- Pendiente de aprobación
  CURRENT_DATE,
  65.00,
  50000.00,
  '{"address": "Av. Principal 123, Lima", "property_value": 250000, "usage_type": "residential", "square_meters": 120}'::jsonb,
  true
);

-- Verificar pólizas creadas
SELECT 
  policy_number,
  status,
  it.name as tipo,
  premium_amount,
  coverage_amount,
  created_at
FROM policies p
JOIN insurance_types it ON p.insurance_type_id = it.id
WHERE status = 'issued'
ORDER BY created_at DESC;
