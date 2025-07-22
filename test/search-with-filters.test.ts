import type { Employee, Tool } from '../src/api';
import { InventoryAPI } from '../src/api';

describe('Search with Filters', () => {
  let api: InventoryAPI;

  beforeEach(() => {
    // Create test data with mixed assignment states
    const tools: Record<`T${number}`, Tool> = {
      T1: {
        id: 'T1' as `T${number}`,
        type: 'HydraulicWrench',
        model: 'HW-100',
        serialNumber: 'SN123',
        calibrationDueDate: '2025-12-01',
        assignedTo: 'E1' as `E${number}`,
        assignedOn: '2025-01-01',
      },
      T2: {
        id: 'T2' as `T${number}`,
        type: 'HydraulicWrench',
        model: 'HW-200',
        serialNumber: 'SN456',
        calibrationDueDate: '2025-11-01',
        assignedTo: null,
        assignedOn: null,
      },
      T3: {
        id: 'T3' as `T${number}`,
        type: 'PneumaticWrench',
        model: 'PW-100',
        serialNumber: 'SN789',
        calibrationDueDate: '2025-10-01',
        assignedTo: null,
        assignedOn: null,
      },
    };

    const employees: Record<`E${number}`, Employee> = {
      E1: { id: 'E1' as `E${number}`, name: 'John Doe' },
    };

    api = new InventoryAPI(tools, employees, 0);
  });

  it('should search all tools when filter is "all"', async () => {
    const results = await api.search('Hydraulic', 'all');
    expect(results).toHaveLength(2); // T1 and T2 both match "Hydraulic"
    expect(results.map((t) => t.id)).toEqual(expect.arrayContaining(['T1', 'T2']));
  });

  it('should search only assigned tools when filter is "assigned"', async () => {
    const results = await api.search('Hydraulic', 'assigned');
    expect(results).toHaveLength(1); // Only T1 is assigned and matches "Hydraulic"
    expect(results[0].id).toBe('T1');
  });

  it('should search only available tools when filter is "available"', async () => {
    const results = await api.search('Hydraulic', 'available');
    expect(results).toHaveLength(1); // Only T2 is available and matches "Hydraulic"
    expect(results[0].id).toBe('T2');
  });

  it('should return empty array when searching assigned tools but none match the query', async () => {
    const results = await api.search('Pneumatic', 'assigned');
    expect(results).toHaveLength(0); // T3 matches "Pneumatic" but is not assigned
  });

  it('should default to "all" filter when no filter is provided', async () => {
    const results = await api.search('Hydraulic');
    expect(results).toHaveLength(2); // Same as filter: 'all'
  });
});
