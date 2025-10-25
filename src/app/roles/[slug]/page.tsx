import ConvexClientProvider from '@/app/ConvexClientProvider';
import ClientRolePage from './ClientRolePage';

/**
 * Server component that wraps the ClientRolePage in the Convex provider.
 */
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return (
    <ConvexClientProvider>
      <ClientRolePage slug={slug} />
    </ConvexClientProvider>
  );
}