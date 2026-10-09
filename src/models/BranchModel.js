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
