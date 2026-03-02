export const MAX_FILES = 50;

export const fieldTableBalanceSheet = [
  'current_assets',
  'current_liabilities',
  'total_assets',
  'total_liabilities',
  'cash_and_cash_equivalents',
  'total_intangible_assets',
  'non_current_assets',
  'property_plant_and_equipment',
  'inventory',
  'accounts_receivable',
  'accounts_payable',
  'shareholder_equity',
  'retained_earnings',
];

export const fieldTableIncome = [
  'revenue',
  'total_comprehensive_income_for_the_year',
  'tax_expense',
  'cost_of_goods_sold',
  'gross_profit',
  'operating_expenses',
  'operating_income',
  'net_income',
  'other_income/expense',
];

export const fieldTableCashFlow = [
  'cash_flow_from_operating_activities',
  'total_depreciation_amortisation',
  'cash_flow_from_investing_activities',
  'cash_flow_from_financing_activities',
  'capital_expenditure',
  'dividends_paid',
  'net_change_in_cash',
  'free_cash_flow',
  'non_cash_items',
];

export const fieldLabelMap: Record<string, { label: string; fieldKey: keyof any }> = {
  current_assets: { label: 'Current Assets', fieldKey: 'current_assets' },
  current_liabilities: {
    label: 'Current Liabilities',
    fieldKey: 'current_liabilities',
  },
  total_assets: { label: 'Total Assets', fieldKey: 'total_assets' },
  total_liabilities: {
    label: 'Total Liabilities',
    fieldKey: 'total_liabilities',
  },
  cash_and_cash_equivalents: {
    label: 'Cash and Cash Equivalents',
    fieldKey: 'cash_and_cash_equivalents',
  },
  total_intangible_assets: {
    label: 'Total Intangible Assets',
    fieldKey: 'total_intangible_assets',
  },
  non_current_assets: {
    label: 'Non-Current Assets',
    fieldKey: 'non_current_assets',
  },
  property_plant_and_equipment: {
    label: 'Property, Plant and Equipment',
    fieldKey: 'property_plant_and_equipment',
  },
  inventory: { label: 'Inventory', fieldKey: 'inventory' },
  accounts_receivable: {
    label: 'Accounts Receivable',
    fieldKey: 'accounts_receivable',
  },
  accounts_payable: { label: 'Accounts Payable', fieldKey: 'accounts_payable' },
  shareholder_equity: {
    label: 'Shareholder Equity',
    fieldKey: 'shareholder_equity',
  },
  retained_earnings: {
    label: 'Retained Earnings',
    fieldKey: 'retained_earnings',
  },
  // Income Statement
  revenue: { label: 'Revenue', fieldKey: 'revenue' },
  total_comprehensive_income_for_the_year: {
    label: 'Total Comprehensive Income for the Year',
    fieldKey: 'total_comprehensive_income_for_the_year',
  },
  tax_expense: { label: 'Tax Expense', fieldKey: 'tax_expense' },
  cost_of_goods_sold: {
    label: 'Cost of Goods Sold',
    fieldKey: 'cost_of_goods_sold',
  },
  gross_profit: { label: 'Gross Profit', fieldKey: 'gross_profit' },
  operating_expenses: {
    label: 'Operating Expenses',
    fieldKey: 'operating_expenses',
  },
  operating_income: { label: 'Operating Income', fieldKey: 'operating_income' },
  net_income: { label: 'Net Income', fieldKey: 'net_income' },
  'other_income/expense': {
    label: 'Other Income/Expense',
    fieldKey: 'other_income/expense',
  },
  // Cash Flow Statement
  cash_flow_from_operating_activities: {
    label: 'Cash Flow from Operating Activities',
    fieldKey: 'cash_flow_from_operating_activities',
  },
  total_depreciation_amortisation: {
    label: 'Total Depreciation & Amortisation',
    fieldKey: 'total_depreciation_amortisation',
  },
  cash_flow_from_investing_activities: {
    label: 'Cash Flow from Investing Activities',
    fieldKey: 'cash_flow_from_investing_activities',
  },
  cash_flow_from_financing_activities: {
    label: 'Cash Flow from Financing Activities',
    fieldKey: 'cash_flow_from_financing_activities',
  },
  capital_expenditure: {
    label: 'Capital Expenditure',
    fieldKey: 'capital_expenditure',
  },
  dividends_paid: { label: 'Dividends Paid', fieldKey: 'dividends_paid' },
  net_change_in_cash: {
    label: 'Net Change in Cash',
    fieldKey: 'net_change_in_cash',
  },
  free_cash_flow: { label: 'Free Cash Flow', fieldKey: 'free_cash_flow' },
  non_cash_items: { label: 'Non-Cash Items', fieldKey: 'non_cash_items' },
};

export const liquidityRatios = (t: (key: string) => string) => {
  return {
    titleKey: 'liquidityRatios',
    title: t('financialStatement.analytics.liquidityRatios'),
    ratios: ['current_ratio', 'quick_ratio', 'cash_ratio'],
  };
};

export const solvencyRatios = (t: (key: string) => string) => {
  return {
    titleKey: 'solvencyRatios',
    title: t('financialStatement.analytics.solvencyRatios'),
    ratios: ['debt_to_equity_ratio', 'debt_to_assets_ratio', 'interest_coverage_ratio'],
  };
};

export const profitabilityRatios = (t: (key: string) => string) => {
  return {
    titleKey: 'profitabilityRatios',
    title: t('financialStatement.analytics.profitabilityRatios'),
    ratios: ['gross_profit_margin', 'operating_profit_margin', 'net_profit_margin', 'return_on_assets', 'return_on_equity'],
  };
};

export const efficiencyRatios = (t: (key: string) => string) => {
  return {
    titleKey: 'efficiencyRatios',
    title: t('financialStatement.analytics.efficiencyRatios'),
    ratios: ['inventory_turnover', 'receivables_turnover', 'days_sales_outstanding', 'asset_turnover'],
  };
};

export const cashFlowRatios = (t: (key: string) => string) => {
  return {
    titleKey: 'cashFlowRatios',
    title: t('financialStatement.analytics.cashFlowRatios'),
    ratios: ['operating_cash_flow_ratio', 'cash_flow_margin', 'free_cash_flow'],
  };
};

export const bidderSpecificCriticalRatios = (t: (key: string) => string) => {
  return {
    titleKey: 'bidderSpecificCriticalRatios',
    title: t('financialStatement.analytics.bidderSpecificCriticalRatios'),
    ratios: ['working_capital', 'cash_conversion_cycle', 'current_liability_coverage', 'times_interest_earned_ratio', 'dupont_roe'],
  };
};

// Ratio formulas mapping
export const ratioFormulas: Record<string, string> = {
  // LIQUIDITY RATIOS
  current_ratio: 'Current Assets / Current Liabilities',
  quick_ratio: '(Current Assets - Inventory) / Current Liabilities',
  cash_ratio: 'Cash & Equivalents / Current Liabilities',

  // SOLVENCY RATIOS
  debt_to_equity_ratio: "Total Liabilities / Shareholders' Equity",
  debt_to_assets_ratio: 'Total Liabilities / Total Assets',
  interest_coverage_ratio: 'Operating Income / Interest Expense',

  // PROFITABILITY RATIOS
  gross_profit_margin: 'Gross Profit / Revenue × 100',
  operating_profit_margin: 'Operating Income / Revenue × 100',
  net_profit_margin: 'Net Income / Revenue × 100',
  return_on_assets: 'Net Income / Total Assets × 100',
  return_on_equity: "Net Income / Shareholders' Equity × 100",

  // EFFICIENCY RATIOS
  inventory_turnover: 'Cost of Goods Sold / Inventory',
  receivables_turnover: 'Revenue / Accounts Receivable',
  days_sales_outstanding: '(Accounts Receivable / Revenue) × 365',
  asset_turnover: 'Revenue / Total Assets',

  // CASH FLOW RATIOS
  operating_cash_flow_ratio: 'Cash Flow from Operations / Current Liabilities',
  cash_flow_margin: 'Cash Flow from Operations / Revenue × 100',
  free_cash_flow: 'Cash Flow from Operations - Capital Expenditures',

  // BIDDER-SPECIFIC CRITICAL RATIOS
  working_capital: 'Current Assets - Current Liabilities',
  cash_conversion_cycle: 'DSO + Days Inventory Outstanding - Days Payable Outstanding',
  current_liability_coverage: 'Cash & Equivalents / Current Liabilities',
  times_interest_earned_ratio: 'EBIT / Interest Expense',
  dupont_roe: 'Net Profit Margin × Asset Turnover × Equity Multiplier\n(where Equity Multiplier = Total Assets / Equity)',
};

// Ratio units mapping
export const ratioUnits: Record<string, string> = {
  // LIQUIDITY RATIOS
  current_ratio: '',
  quick_ratio: '',
  cash_ratio: '',

  // SOLVENCY RATIOS
  debt_to_equity_ratio: '',
  debt_to_assets_ratio: '',
  interest_coverage_ratio: '',

  // PROFITABILITY RATIOS
  gross_profit_margin: '%',
  operating_profit_margin: '%',
  net_profit_margin: '%',
  return_on_assets: '%',
  return_on_equity: '%',

  // EFFICIENCY RATIOS
  inventory_turnover: '',
  receivables_turnover: '',
  days_sales_outstanding: 'day',
  asset_turnover: '',

  // CASH FLOW RATIOS
  operating_cash_flow_ratio: '',
  cash_flow_margin: '%',
  free_cash_flow: '', // Currency unit, typically handled separately

  // BIDDER-SPECIFIC CRITICAL RATIOS
  working_capital: '', // Currency unit, typically handled separately
  cash_conversion_cycle: 'day',
  current_liability_coverage: '',
  times_interest_earned_ratio: '',
  dupont_roe: '%',
};

export const allowedExtensions = ['.pdf', '.xlsx', '.xls', '.csv', '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.tar.gz'];

export const MIN_PAGE_SIZE = 10;

export const MAX_INPUT_LENGTH = 20;
