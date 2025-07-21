import { Card, Space, Typography, Table } from 'antd';

const { Title, Paragraph } = Typography;

const criteriaColumns = [
  {
    title: 'Area',
    dataIndex: 'area',
    key: 'area',
    width: '35%',
  },
  {
    title: 'Criteria',
    dataIndex: 'criteria',
    key: 'criteria',
  },
];

const criteriaData = [
  { key: 'functionality', area: 'Functionality', criteria: 'Meets core requirements' },
  { key: 'code', area: 'Code Quality', criteria: 'Modular, clean, easy to read' },
  { key: 'uiux', area: 'UI/UX', criteria: 'Basic styling, usability, visual clarity' },
  { key: 'api', area: 'API Design', criteria: 'Clear routes, meaningful status codes, simple structure' },
  { key: 'docs', area: 'Documentation', criteria: 'Clear README with setup, approach, assumptions' },
  {
    key: 'bonus',
    area: 'Bonus Points',
    criteria: 'TypeScript, unit tests, error states, responsive design, deployed demo',
  },
];

const Home = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Scenario */}
        <Card>
          <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
            <span role="img" aria-label="search">
              🔍
            </span>
            The Scenario
          </Title>
          <Paragraph>
            You are developing a web-based internal tool to support field operations for an industrial site. Technicians
            in the field use a variety of smart tools (such as torque wrenches, smart screwdrivers, and pressure gauges)
            to complete quality-critical tasks. These tools must be tracked and assigned to the appropriate personnel in
            order to ensure traceability, productivity, and safety.
          </Paragraph>
          <Paragraph>Your task is to build a simple tool inventory and assignment application that:</Paragraph>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Displays a catalog of available tools</li>
            <li>Allows a supervisor to assign a tool to a technician</li>
            <li>Shows which tools are assigned and to whom</li>
          </ul>
          <Paragraph className="mt-4">
            The UI should be intuitive, responsive, and optimized for efficient data display and interaction. Your
            design should make it easy to manage tools and understand their current status at a glance.
          </Paragraph>
          <Paragraph className="mt-4">
            <b>
              See the full requirements in your source repo here: frontend-inventory/docs/inventory.md{' '}
            </b>
          </Paragraph>
        </Card>

        {/* Evaluation Criteria */}
        <Card>
          <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span role="img" aria-label="check">
              ✅
            </span>
            Evaluation Criteria
          </Title>
          <Table columns={criteriaColumns} dataSource={criteriaData} pagination={false} bordered size="middle" />
        </Card>

        {/* Submission */}
        <Card>
          <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <span role="img" aria-label="calendar">
              📅
            </span>
            Submission
          </Title>
          <Paragraph>Submit the following:</Paragraph>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Follow the GitHub Classroom structure for your project</li>
            <li>
              README file containing:
              <ul className="list-disc list-inside ml-6 space-y-1 mt-1">
                <li>Setup instructions</li>
                <li>Time taken</li>
                <li>Design choices</li>
                <li>How you would improve/scale it</li>
                <li>Optional: Link to live deployed version (e.g. Render, Vercel)</li>
              </ul>
            </li>
          </ul>
        </Card>
      </Space>
    </div>
  );
};

export default Home;
