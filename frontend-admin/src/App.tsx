import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import router from "./routes";

const { Header, Content } = Layout;
const { Title } = Typography;

const NavConfig: MenuProps['items'] =[
  {
    key: '/knowledge',
    label: 'Knowledge',
  },
];

const Head = () => {
  const toIndex = () => {
    location.href = '/';
  }
  const menuNavigate = (key: string) => {
    const nav = NavConfig.find(it => it?.key === key);
    const path = nav?.key?.toString();
    if (path) {
      location.href = path;
    }
  }

  return (
    <Header style={{ display: 'flex', alignItems: 'center' }}>
      <Title level={3} onClick={toIndex}>Index</Title>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        items={NavConfig}
        style={{ flex: 1, minWidth: 0 }}
        onClick={({ key }) => menuNavigate(key)}
      />
    </Header>
  )
}

function App() {
  return (
    <Suspense fallback="Loading...">
      <Layout>
        <Head />
        <Content style={{ padding: '0 16px' }}>
          <RouterProvider router={router} />
        </Content>
      </Layout>  
    </Suspense>
  );
}

export default App;