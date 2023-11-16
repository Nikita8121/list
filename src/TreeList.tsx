import { useCallback, useState } from 'react';
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
  /*   KeyboardBindings,
  InteractionMode, */
} from 'react-complex-tree';

/* type Item = {
  index: string;
  isFolder?: boolean;
  children: string[];
  data: string;
}; */

type Node = {
  id: string;
  text: string;
  nodes: Node[];
};
type NodeList = Node[];

type TreeItems = { [key: string]: TreeItem<string> };

const generateItem = (index: number): TreeItem<string> => ({
  index: `child${index}`,
  isFolder: /* index % 2 === 0 */ true,
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

const initialItems = {
  root: {
    index: 'root',
    isFolder: true,
    children: [],
    data: 'Root item',
  },
};

export const TreeList = () => {
  for (let i = 1; i <= 50; i++) {
    mockItems[`child${i}`] = generateItem(i);
  }

  /* const storedTree = localStorage.getItem('tree');
const mockItems: TreeItems = storedTree ? nodeListToTree(JSON.parse(storedTree)) : []; */

  const [isChangesApplied, setIsChangesApplied] = useState<boolean>();

  const handleTreeChange = () => {
    setIsChangesApplied(true);
  };

  const treeListItemsToNodeList = useCallback((items: TreeItems): NodeList => {
    const treeItemToNode = (item: TreeItem<string>): Node => {
      const node: Node = {
        id: item.index.toString(),
        text: item.data,
        nodes: item.children?.length
          ? item.children.map((child) => treeItemToNode(items[child]))
          : [],
      };
      return node;
    };

    console.log('items', items);

    const nodeList: NodeList = [];
    const rootItem = items.root;
    const children = rootItem.children;
    children?.forEach((child) => {
      const childItem = items[child];
      const childItemNode: Node = treeItemToNode(childItem);
      nodeList.push(childItemNode);
    });
    return nodeList;
  }, []);

  /*  const nodeListToTree = useCallback((nodeList: NodeList): Node => {
    const tree: Node = {
      id: 'root',
      text: 'Root item',
      nodes: [],
    };

    const addNodeToTree = (parentNode: Node, nodeToAdd: Node) => {
      parentNode.nodes.push(nodeToAdd);
    };

    const addNodesToTree = (parentNode: Node, nodesToAdd: NodeList) => {
      nodesToAdd.forEach((node) => {
        const newNode = {
          id: node.id,
          text: node.text,
          nodes: [],
        };
        addNodeToTree(parentNode, newNode);
        addNodesToTree(newNode, node.nodes);
      });
    };

    addNodesToTree(tree, nodeList);

    return tree;
  }, []); */

  const handleSaveChanges = () => {
    const node = treeListItemsToNodeList(mockItems);
    console.log(node);
    localStorage.setItem('tree', JSON.stringify(node));
    setIsChangesApplied(false);
  };

  return (
    <>
      {isChangesApplied && (
        <button onClick={handleSaveChanges}>Save Changes</button>
      )}
      <UncontrolledTreeEnvironment
        dataProvider={
          new StaticTreeDataProvider(mockItems, (item, data) => ({
            ...item,
            data,
          }))
        }
        getItemTitle={(item) => item.data}
        viewState={{}}
        canDragAndDrop={true}
        canReorderItems={true}
        canRename={true}
        canDropOnFolder={true}
        onRenameItem={handleTreeChange}
        onDrop={handleTreeChange}
      >
        <Tree treeId="tree-2" rootItem="root" treeLabel="Tree Example" />
      </UncontrolledTreeEnvironment>
    </>
  );
};
