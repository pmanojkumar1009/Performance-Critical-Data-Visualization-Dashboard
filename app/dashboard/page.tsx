import { Suspense } from 'react';
import { DataProvider } from '@/components/providers/DataProvider';
import { DataGenerator } from '@/lib/dataGenerator';
import DashboardClient from '@/components/DashboardClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Server Component - Generate initial data
async function getInitialData() {
  try {
    const generator = new DataGenerator();
    return generator.generateInitialDataset(1000);
  } catch (error) {
    console.error('Error generating initial data:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const initialData = await getInitialData();

  return (
    <ErrorBoundary>
      <DataProvider initialData={initialData}>
        <Suspense fallback={<DashboardLoading />}>
          <ErrorBoundary>
            <DashboardClient />
          </ErrorBoundary>
        </Suspense>
      </DataProvider>
    </ErrorBoundary>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}



