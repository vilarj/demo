import * as fs from "node:fs";
import * as path from "node:path";

import { faker } from "@faker-js/faker";

import {
  type Employee,
  type EmployeeId,
  type ISO8601Date,
  type Tool,
  type ToolId,
  type ToolType,
} from "../src/inventory-api";

function randomToolType(): ToolType {
  const types: ToolType[] = [
    "HydraulicWrench",
    "PneumaticWrench",
    "Tensioner",
    "TorqueGun",
    "TorqueMultiplier",
  ];
  return faker.helpers.arrayElement(types);
}

const toolModels: Record<ToolType, Array<Tool["model"]>> = {
  HydraulicWrench: ["HW-100", "HW-200", "HW-300"],
  PneumaticWrench: ["PW-100", "PW-200", "PW-300"],
  Tensioner: ["TN-100", "TN-200", "TN-300"],
  TorqueGun: ["TG-100", "TG-200", "TG-300"],
  TorqueMultiplier: ["TM-100", "TM-200", "TM-300"],
};

function randomISODate(past = false): ISO8601Date {
  const date = past
    ? faker.date.recent({ days: 30 })
    : faker.date.soon({ days: 180 });
  return date.toISOString().split("T")[0] as ISO8601Date;
}

function createEmployees(count: number): Record<EmployeeId, Employee> {
  // Generate unique random IDs in the range 2000–6000
  const idPool = faker.helpers.shuffle(
    Array.from({ length: 6000 - 2000 + 1 }, (_, i) => 2000 + i),
  );
  const employees: Record<EmployeeId, Employee> = {};
  for (let i = 1; i <= count; i += 1) {
    const uniqueNum = idPool.pop() as number;
    const paddedNum = String(uniqueNum).padStart(3, "0");
    const id = `E${paddedNum}` as EmployeeId;
    employees[id] = {
      id,
      name: faker.person.fullName(),
    };
  }
  return employees;
}

function createTools(
  count: number,
  employeeIds: EmployeeId[],
): Record<ToolId, Tool> {
  const tools: Record<ToolId, Tool> = {};
  const snPool = faker.helpers.shuffle(
    Array.from(
      { length: count },
      (_, __) => `SN${faker.string.alphanumeric(10).toUpperCase()}`,
    ),
  );
  for (let i = 1; i <= count; i += 1) {
    const id = `T${i}` as ToolId;
    const assigned = faker.datatype.boolean();
    const assignedTo = assigned
      ? faker.helpers.arrayElement(employeeIds)
      : null;
    const assignedOn = assignedTo ? randomISODate() : null;
    // 1 in 20 chance for a past date
    const usePastDate = faker.number.int({ min: 1, max: 20 }) === 1;
    const toolType = randomToolType();
    tools[id] = {
      id,
      type: toolType,
      model: faker.helpers.arrayElement(toolModels[toolType]),
      serialNumber: snPool.pop() as string,
      calibrationDueDate: randomISODate(usePastDate),
      assignedTo,
      assignedOn,
    };
  }
  return tools;
}

describe("MockInventorySystem population", () => {
  it.skip("should create a system with 100 employees and 500 tools", () => {
    expect.hasAssertions();
    const employees = createEmployees(100);
    const employeeIds = Object.keys(employees) as EmployeeId[];
    const tools = createTools(500, employeeIds);

    expect(Object.keys(employees)).toHaveLength(100);
    expect(Object.keys(tools)).toHaveLength(500);

    fs.mkdirSync(path.join(__dirname, "../src/data"));

    fs.writeFileSync(
      path.join(__dirname, "../src/data/employees.json"),
      JSON.stringify(employees, null, 2),
    );
    fs.writeFileSync(
      path.join(__dirname, "../src/data/tools.json"),
      JSON.stringify(tools, null, 2),
    );
  });
});
