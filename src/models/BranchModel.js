export const DEFAULT_BRANCH_ID = 'BR-DEFAULT';

export const DEFAULT_BRANCH = {
  id: DEFAULT_BRANCH_ID,
  name: 'XCrepes Pusat',
  code: 'PUSAT',
  address: '',
  phone: '',
  isActive: true,
  createdAt: null,
  updatedAt: null
};

export const BRANCH_STORAGE_KEY = 'pos_store_branches';

export const normalizeBranchIds = (value) => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter(Boolean)));
};

export const userCanAccessBranch = (user, branchId) => {
  if (!user || !branchId) return false;
  if (user.role === 'superadmin') return true;
  const branchIds = normalizeBranchIds(user.branchIds);
  return branchIds.length === 0 || branchIds.includes(branchId);
};

export const isRowForBranch = (rowId, branchId = DEFAULT_BRANCH_ID) => {
  if (!rowId) return false;
  const isDefaultBranch = !branchId || branchId === DEFAULT_BRANCH_ID;
  const hasBranchPrefix = String(rowId).includes('__');
  
  if (isDefaultBranch) {
    return !hasBranchPrefix || String(rowId).startsWith(`${DEFAULT_BRANCH_ID}__`);
  }
  
  return String(rowId).startsWith(`${branchId}__`);
};

export const formatBranchRowId = (rawId, branchId = DEFAULT_BRANCH_ID) => {
  if (!rawId) return rawId;
  const isDefaultBranch = !branchId || branchId === DEFAULT_BRANCH_ID;
  if (isDefaultBranch) {
    return rawId;
  }
  if (String(rawId).startsWith(`${branchId}__`)) return rawId;
  return `${branchId}__${rawId}`;
};

export const stripBranchFromId = (id) => {
  if (!id) return '';
  const str = String(id);
  if (str.includes('__')) {
    return str.split('__')[1] || str;
  }
  return str;
};
