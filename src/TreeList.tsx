import {
  DetailedHTMLProps,
  HTMLProps,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
  DraggingPosition,
  TreeEnvironmentRef,
  TreeRef,
  TreeInformation,
} from 'react-complex-tree';

type Node = {
  id: string;
  text: string;
  nodes: Node[];
};
type NodeList = Node[];

type TreeItems = { [key: string]: TreeItem<string> };

const generateItem = (index: number): TreeItem<string> => ({
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

const renderTreeContainer = (props: {
  children: ReactNode;
  containerProps: HTMLProps<unknown>;
  info: TreeInformation;
}) => {
  // Create a new props object with the element type and the custom class name

  return (
    <div
      style={{ minHeight: '30px', position: 'relative' }}
      className="rct-tree-root"
    >
      {props.children}
    </div>
  );
};

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

const useScrollbarFollowMouse = (isDragging: boolean) => {
  const draggableRef = useRef<HTMLDivElement>(null);
  const mouseCoords = useRef({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  let timeout: number | undefined = undefined;
  /* const handleDragStart = (e) => {
    if (!draggableRef.current) return;
    const slider = draggableRef.current?.children[0];
    if (!slider) return;

    const startX = e.pageX - slider.offsetLeft;
    const startY = e.pageY - slider.offsetTop;
    const scrollLeft = slider.scrollLeft;
    const scrollTop = slider.scrollTop;
    mouseCoords.current = { startX, startY, scrollLeft, scrollTop };
    setIsMouseDown(true);
    document.body.style.cursor = 'grabbing';
  }; */
  /* const handleDragEnd = () => {
    setIsMouseDown(false);
    if (!ourRef.current) return;
    document.body.style.cursor = 'default';
  }; */
  const handleDrag = (e) => {
    e.preventDefault();

    if (!isDragging) return;

    timeout = setTimeout(() => {
      if (!draggableRef.current) return;
      const slider = draggableRef.current;

      const divOffsetLeft = draggableRef.current?.offsetLeft || 0;
      const divOffsetRight = draggableRef.current?.offsetTop || 0;
      const x = e.clientX - divOffsetLeft; // get the mouse x position relative to the div
      const y = e.clientY - divOffsetRight;
      const walkX = x - mouseCoords.current.startX;
      const walkY = y - mouseCoords.current.startY;
      slider.scrollLeft = mouseCoords.current.scrollLeft + walkX;
      slider.scrollTop = mouseCoords.current.scrollTop + walkY;
    }, 500);
  };

  useEffect(() => {
    if (!draggableRef.current) return;

    draggableRef.current?.addEventListener('mousemove', function (e) {
      // add mousemove event listener
      const divOffsetLeft = draggableRef.current?.offsetLeft || 0;
      const divOffsetRight = draggableRef.current?.offsetTop || 0;

      const x = e.clientX - divOffsetLeft; // get the mouse x position relative to the div
      const y = e.clientY - divOffsetRight; // get the mouse y position relative to the div
      console.log('x: ' + x + ', y: ' + y); // print the coordinates
    });

    draggableRef.current?.addEventListener('mousemove', handleDrag, false);

    return () => {
      draggableRef.current?.removeEventListener('mousemove', handleDrag);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) clearTimeout(timeout);
  }, [isDragging]);

  return { draggableRef };
};

export const TreeList = () => {
  /*   const draggableRef = useRef<HTMLDivElement>(null);
   */
  const environment = useRef<TreeEnvironmentRef<string, 'expandedItems'>>(null);
  const tree = useRef<TreeRef<string>>(null);

  /*   const tree = useRef<TreeRef<string>>();
   */
 /*  for (let i = 1; i <= 50; i++) {
    mockItems[`child${i}`] = generateItem(i);
  } */


  useEffect(() => {
    if (!environment.current || !tree.current) return;

    const treeEnv = environment.current;
    console.log(treeEnv);
    treeEnv.dragAndDropContext.onStartDraggingItems = () => {
      console.log('dragging');
      setIsDraggingItem(true);
    };

    setInterval(() => {
      const isDragging =
        !!tree.current?.dragAndDropContext?.draggingItems?.length;

      setIsDraggingItem(isDragging);
    }, 1000);
  }, []);

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
    console.log('dropped', items);
    if (target.targetType === 'item')
      mockItems[target.targetItem].isFolder = true;
    handleTreeChange();
    setIsDraggingItem(false);
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
      <div>
        <UncontrolledTreeEnvironment
          ref={environment}
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
          <Tree
            ref={tree}
            treeId="tree-1"
            rootItem="root"
            treeLabel="Tree Example"
          />
        </UncontrolledTreeEnvironment>
      </div>
    </>
  );
};
