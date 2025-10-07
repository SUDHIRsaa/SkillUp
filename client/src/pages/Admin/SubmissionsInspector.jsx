import React from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';

export default function SubmissionsInspector() {
  return (
    <Layout>
      <Card title="Submissions removed">
        <div className="text-sm text-gray-600">Submissions listing has been removed from this deployment.</div>
      </Card>
    </Layout>
  );
}