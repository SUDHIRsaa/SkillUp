import React from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';

export default function CodingManager() {
  return (
    <Layout>
      <Card title="Coding feature removed">
        <div className="text-sm text-gray-600">The coding/challenges admin page has been removed from this deployment.</div>
      </Card>
    </Layout>
  );
}