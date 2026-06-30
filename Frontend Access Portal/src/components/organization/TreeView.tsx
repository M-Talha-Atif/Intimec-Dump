
import { Card, CardContent } from '@/components/ui/card';
import TreeBranch from './TreeBranch';
import { OrgNodeData } from '@/types/organization';

interface TreeViewProps {
  data: OrgNodeData;
}

const TreeView = ({ data }: TreeViewProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <TreeBranch node={data} isRoot={true} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TreeView;
