import PointsDisplay from '../PointsDisplay';

export default function PointsDisplayExample() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Points Display Variants</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Large variant:</p>
            <PointsDisplay points={12500} variant="large" />
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Default variant:</p>
            <PointsDisplay points={2450} />
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Compact variant:</p>
            <PointsDisplay points={850} variant="compact" />
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Without icon:</p>
            <PointsDisplay points={1200} showIcon={false} />
          </div>
        </div>
      </div>
    </div>
  );
}