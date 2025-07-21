import { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, ConfigProvider } from 'antd';
import { HomeIcon, DocumentDuplicateIcon, UserIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import cumulusLogo from './assets/cumulus_logo.png';

import Home from './pages/Home';
import Demo from './pages/Demo';

const { Header, Content, Sider } = Layout;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = useMemo(() => {
    if (location.pathname === '/demo') return 'demo';
    return 'home';
  }, [location.pathname]);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00aff0', colorInfo: '#00aff0', fontFamily: 'Inter, "Source Sans 3", sans-serif' } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div className="flex items-center justify-center h-12 m-2">
            <img src={cumulusLogo} alt="Cumulus Logo" className="mt-5 h-8" />
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => navigate(key === 'home' ? '/' : `/${key}`)}
            items={[
              {
                key: 'home',
                icon: <HomeIcon className="h-5 w-5" />,
                label: 'Home',
              },
              {
                key: 'demo',
                icon: <DocumentDuplicateIcon className="h-5 w-5" />,
                label: 'Demo',
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              paddingInline: 16,
              background: '#001628',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div className="ml-auto flex gap-4 items-center">
              <BellIcon className="h-6 w-6 cursor-pointer text-white" />
              <Cog6ToothIcon className="h-6 w-6 cursor-pointer text-white" />
              <Avatar style={{ backgroundColor: 'transparent' }} icon={<UserIcon className="h-5 w-5 text-white" />} />
            </div>
          </Header>
          <Content style={{ margin: '16px' }}>
            <div className="p-6 bg-white rounded shadow-sm min-h-[360px]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/demo" element={<Demo />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
