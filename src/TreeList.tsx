import { useMemo, useRef, useState } from 'react';
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
  DraggingPosition,
} from 'react-complex-tree';

type Node = {
  id: string;
  text: string;
  nodes: Node[];
};
type NodeList = Node[];

type TreeItems = { [key: string]: TreeItem<string> };

/* const generateItem = (index: number): TreeItem<string> => ({
  index: `child${index}`,
  isFolder: true,
  children: [],
  data: `Child item ${index}`,
});

const mockItems: TreeItems = {
  root: {
    index: 'root',
    isFolder: true,
    children: Array.from({ length: 50 }, (_, i) => `child${i + 1}`),
    data: 'Root item',
  },
};
 */

const nodeListToTreeItems = (nodeList: NodeList): TreeItems => {
  const treeItems: TreeItems = {
    root: {
      index: 'root',
      isFolder: true,
      children: [],
      data: 'Root item',
    },
  };

  const nodeToTreeItem = (node: Node): TreeItem => {
    const treeItem: TreeItem = {
      index: node.id,
      data: node.text,
      isFolder: !!node.nodes.length,
      children: node.nodes.map((childNode) => childNode.id),
    };

    node.nodes.forEach((childNode) => {
      treeItems[childNode.id] = nodeToTreeItem(childNode);
    });

    return treeItem;
  };

  nodeList.forEach((node) => {
    treeItems.root.children?.push(node.id);
    treeItems[node.id] = nodeToTreeItem(node);
  });

  return treeItems;
};

const treeListItemsToNodeList = (items: TreeItems): NodeList => {
  const treeItemToNode = (item: TreeItem<string>): Node => {
    const node: Node = {
      id: item.index.toString(),
      text: item.data,
      nodes: item.children
        ? item.children.map((child) => treeItemToNode(items[child]))
        : [],
    };
    return node;
  };

  const nodeList: NodeList = [];
  const rootItem = items.root;
  const children = rootItem.children;
  children?.forEach((child) => {
    const childItem = items[child];
    const childItemNode: Node = treeItemToNode(childItem);
    nodeList.push(childItemNode);
  });
  return nodeList;
};

export const TreeList = () => {
  /*   const tree = useRef<TreeRef<string>>();
   */
  /*  for (let i = 1; i <= 50; i++) {
    mockItems[`child${i}`] = generateItem(i);
  } */

  const storedTree = useRef<string | null>(localStorage.getItem('tree'));
  const mockItems: TreeItems = useMemo(
    () =>
      nodeListToTreeItems(JSON.parse(storedTree.current ?? '[]') as NodeList),
    []
  );

  const treeItemsIdsOpened = Object.values(mockItems)
    .filter((item) => item.children?.length)
    .map((item) => item.index);

  const [isChangesApplied, setIsChangesApplied] = useState<boolean>();

  const handleTreeChange = () => {
    setIsChangesApplied(true);
  };

  const handleDrop = (items: TreeItem<string>[], target: DraggingPosition) => {
    if (target.targetType === 'item')
      mockItems[target.targetItem].isFolder = true;
    handleTreeChange();
  };

  const handleSaveChanges = () => {
    const node = treeListItemsToNodeList(mockItems);
    console.log('savedNode', node);
    localStorage.setItem('tree', JSON.stringify(node));
    setIsChangesApplied(false);
  };

  return (
    <>
      {isChangesApplied && (
        <button onClick={handleSaveChanges}>Save Changes</button>
      )}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <UncontrolledTreeEnvironment
          dataProvider={
            new StaticTreeDataProvider(mockItems, (item, data) => {
              return {
                ...item,
                data,
              };
            })
          }
          viewState={{
            ['tree-1']: {
              expandedItems: treeItemsIdsOpened,
            },
          }}
          getItemTitle={(item) => item.data}
          canDragAndDrop={true}
          canReorderItems={true}
          canRename={true}
          canDropOnFolder={true}
          canDropOnNonFolder={true}
          onSelectItems={(/* items, treeId */) => console.log('selected')}
          onRenameItem={handleTreeChange}
          onDrop={handleDrop}
        >
          <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
        </UncontrolledTreeEnvironment>
      </div>
    </>
  );
};
