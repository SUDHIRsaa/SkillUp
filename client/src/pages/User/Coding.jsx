import Layout from '../../components/Layout';
import Card from '../../components/Card';

export default function Coding() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card title="Coding Editor Removed">
          <div className="text-sm text-gray-600">The online coding editor has been removed from the application. If you need coding problem management, use the Admin &gt; MCQs area or import/export features. For safety and maintainability, in-browser execution and judge integrations were disabled.</div>
        </Card>
      </div>
    </Layout>
  );
}