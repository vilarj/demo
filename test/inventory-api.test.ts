import type { EmployeeId, ISO8601Date, ToolId } from '../src/inventory-api';
import { MockInventorySystem } from '../src/inventory-api';

const today = (): ISO8601Date => new Date().toISOString().split('T')[0] as ISO8601Date;

describe('MockInventorySystem', () => {
  beforeAll(() => {
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-06-08T00:00:00.000Z');
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('assign', () => {
    it('assignTool assigns tool if unassigned and not overdue', async () => {
      expect.hasAssertions();
      const employeeId: EmployeeId = 'E1';
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: null,
            assignedOn: null,
          },
        },
        { E1: { id: employeeId, name: 'Alice' } },
        0,
      );
      const result = await system.assignTool({ toolId, employeeId });
      const tool = await system.getTool(toolId);
      expect({ result, tool }).toMatchSnapshot();
    });

    it('assignTool invalid if already assigned to same employee', async () => {
      expect.hasAssertions();
      const employeeId: EmployeeId = 'E1';
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: 'E1',
            assignedOn: today(),
          },
        },
        { E1: { id: employeeId, name: 'Alice' } },
        0,
      );
      const result = await system.assignTool({ toolId, employeeId });
      const tool = await system.getTool(toolId);
      expect({ result, tool }).toMatchSnapshot();
    });

    it('assignTool invalid already assigned to another employee', async () => {
      expect.hasAssertions();
      const employeeId: EmployeeId = 'E1';
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: 'E2' as EmployeeId,
            assignedOn: today(),
          },
        },
        {
          E1: { id: employeeId, name: 'Alice' },
          E2: { id: 'E2', name: 'Bob' },
        },
        0,
      );
      const result = await system.assignTool({ toolId, employeeId });
      const tool = await system.getTool(toolId);
      expect({ result, tool }).toMatchSnapshot();
    });

    it('assignTool invalid if tool is overdue for calibration', async () => {
      expect.hasAssertions();
      const employeeId: EmployeeId = 'E1';
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: '2000-01-01' as ISO8601Date,
            assignedTo: null,
            assignedOn: null,
          },
        },
        { E1: { id: employeeId, name: 'Alice' } },
        0,
      );
      const result = await system.assignTool({ toolId, employeeId });
      const tool = await system.getTool(toolId);
      expect({ result, tool }).toMatchSnapshot();
    });
  });

  describe('reassign', () => {
    it('reassignTool reassigns if already assigned', async () => {
      expect.hasAssertions();
      const employeeId1: EmployeeId = 'E1';
      const employeeId2: EmployeeId = 'E2';
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: employeeId2,
            assignedOn: today(),
          },
        },
        {
          E1: { id: employeeId1, name: 'Alice' },
          E2: { id: employeeId2, name: 'Bob' },
        },
        0,
      );
      const result = await system.reassignTool({
        toolId,
        employeeId: employeeId1,
      });
      const tool = await system.getTool(toolId);
      expect({ result, tool }).toMatchSnapshot();
    });

    it('reassignTool invalid if not assigned', async () => {
      expect.hasAssertions();
      const employeeId: EmployeeId = 'E1';
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: null,
            assignedOn: null,
          },
        },
        { E1: { id: employeeId, name: 'Alice' } },
        0,
      );
      const result = await system.reassignTool({
        toolId,
        employeeId,
      });
      const tool = await system.getTool(toolId);
      expect({ result, tool }).toMatchSnapshot();
    });
  });

  describe('getTool', () => {
    it('returns a deep clone of the tool if it exists', async () => {
      expect.hasAssertions();
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: null,
            assignedOn: null,
          },
        },
        {},
        0,
      );
      const result = await system.getTool(toolId);
      const again = await system.getTool(toolId);
      expect({ result }).toMatchSnapshot();
      // Mutate result and check original is not affected (deep clone)
      if (result) result.model = 'CHANGED';
      expect(again?.model).not.toBe('CHANGED');
    });

    it('returns null if the tool does not exist', async () => {
      expect.hasAssertions();
      const system = new MockInventorySystem({}, {}, 0);
      const result = await system.getTool('T999' as ToolId);
      expect({ result }).toMatchSnapshot();
    });
  });

  describe('getEmployee', () => {
    it('returns a deep clone of the employee if it exists', async () => {
      expect.hasAssertions();
      const employeeId: EmployeeId = 'E1';
      const system = new MockInventorySystem(
        {},
        {
          E1: { id: employeeId, name: 'Alice' },
        },
        0,
      );
      const result = await system.getEmployee(employeeId);
      expect(result).toBeTruthy();
      expect({ result }).toMatchSnapshot();
      // Mutate result and check original is not affected (deep clone)
      result!.name = 'CHANGED';
      const again = await system.getEmployee(employeeId);
      expect(again?.name).not.toBe('CHANGED');
    });

    it('returns null if the employee does not exist', async () => {
      expect.hasAssertions();
      const system = new MockInventorySystem({}, {}, 0);
      const result = await system.getEmployee('E999' as EmployeeId);
      expect({ result }).toMatchSnapshot();
    });
  });

  describe('getTools', () => {
    it('returns a deep clone of all tools', async () => {
      expect.hasAssertions();
      const toolId: ToolId = 'T1';
      const system = new MockInventorySystem(
        {
          T1: {
            id: toolId,
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: null,
            assignedOn: null,
          },
        },
        {},
        0,
      );
      const result = await system.getTools();
      expect({ result }).toMatchSnapshot();
      // Mutate result and check original is not affected (deep clone)
      result[0]!.model = 'CHANGED';
      const again = await system.getTools();
      expect(again[0]?.model).not.toBe('CHANGED');
    });

    it('returns an empty array if there are no tools', async () => {
      expect.hasAssertions();
      const system = new MockInventorySystem({}, {}, 0);
      const result = await system.getTools();
      expect({ result }).toMatchSnapshot();
    });
  });

  describe('getTools (filtering)', () => {
    let system: MockInventorySystem;
    beforeAll(() => {
      system = new MockInventorySystem(
        {
          T1: {
            id: 'T1',
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: null,
            assignedOn: null,
          },
          T2: {
            id: 'T2',
            type: 'HydraulicWrench',
            model: 'HW-1',
            serialNumber: 'SN123',
            calibrationDueDate: today(),
            assignedTo: 'E1',
            assignedOn: '2025-06-01',
          },
        },
        {
          E1: { id: 'E1', name: 'Alice' },
        },
        0,
      );
    });
    it('return all tools by default', async () => {
      expect.hasAssertions();
      const result = await system.getTools();
      expect({ result }).toMatchSnapshot();
    });
    it('all filter', async () => {
      expect.hasAssertions();
      const result = await system.getTools('all');
      expect({ result }).toMatchSnapshot();
    });
    it('assigned filter', async () => {
      expect.hasAssertions();
      const result = await system.getTools('assigned');
      expect({ result }).toMatchSnapshot();
    });
    it('available filter', async () => {
      expect.hasAssertions();
      const result = await system.getTools('available');
      expect({ result }).toMatchSnapshot();
    });
  });

  describe('getEmployees', () => {
    it('returns a deep clone of all employees', async () => {
      expect.hasAssertions();
      const employeeId: EmployeeId = 'E1';
      const system = new MockInventorySystem(
        {},
        {
          E1: { id: employeeId, name: 'Alice' },
        },
        0,
      );
      const result = await system.getEmployees();
      expect({ result }).toMatchSnapshot();
      result[0]!.name = 'CHANGED';
      const again = await system.getEmployees();
      expect(again[0]?.name).not.toBe('CHANGED');
    });

    it('returns an empty array if there are no employees', async () => {
      expect.hasAssertions();
      const system = new MockInventorySystem({}, {}, 0);
      const result = await system.getEmployees();
      expect({ result }).toMatchSnapshot();
    });
  });
});
