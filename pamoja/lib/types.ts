export type Profile={id:string;full_name:string|null;email:string|null;avatar_url:string|null;currency:string|null};
export type Group={id:string;name:string;description:string|null;currency:string;created_by:string;created_at:string};
export type Member={group_id:string;user_id:string;profiles?:Profile|null};
export type Expense={id:string;group_id:string;title:string;amount:number;paid_by:string;expense_date:string;category:string;notes:string|null;receipt_path:string|null;created_by:string;created_at:string;expense_splits?:Split[]};
export type Split={id:string;expense_id:string;user_id:string;amount:number};
export type Settlement={id:string;group_id:string;from_user:string;to_user:string;amount:number;created_at:string;note:string|null};
export type Debt={from:string;to:string;amount:number};
