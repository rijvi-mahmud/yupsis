import { ItemType } from "@/App";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// unit conversion function
const findUnitById = (units: ItemType[], id: string) =>
  units.find((unit) => unit.id === id);

function collectUnits(units: ItemType[], unit: ItemType): ItemType[] {
  if (!unit) return [];

  const baseUnit = findUnitById(units, unit.baseUnit as string);
  const chain = collectUnits(units, baseUnit as ItemType);

  return [unit, ...chain];
}

export const unitConversion = (units: ItemType[], id: string) => {
  const startingUnit = findUnitById(units, id);
  return collectUnits(units, startingUnit as ItemType);
};

// Function to flatten the tree structure into a plain array
type TreeNode = {
  id: string;
  name: string;
  baseUnit?: string;
  conversionFactor?: number;
  children: TreeNode[];
};

export const flattenTree = (node: TreeNode) => {
  const result = [];
  result.push({
    id: node.id,
    name: node.name,
    baseUnit: node.baseUnit,
    conversionFactor: node.conversionFactor,
  });
  node.children?.forEach((child) => {
    result.push(...flattenTree(child));
  });
  return result;
};

export const createTree = (array: ItemType[]) => {
  const unitMap = new Map();
  array.forEach((unit) => unitMap.set(unit.id, { ...unit, children: [] }));

  const tree: TreeNode[] = [];
  unitMap.forEach((unit) => {
    if (unit.baseUnit) {
      const parent = unitMap.get(unit.baseUnit);
      if (parent) {
        parent.children.push(unit);
      }
    } else {
      tree.push(unit);
    }
  });

  return tree;
};
