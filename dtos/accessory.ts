export interface AccessoryDTO {
	id: string;
	name: string;
	photo: string;
	price: number;
	endDate: Date;
	type: number;
}

export interface CreateAccessoryDTO{
    name: string;
    price: number;
    endDate: Date;
    type: number;
}

export interface UpdateAccessoryDTO {
    id: string;
	name: string;
	price: number;
	endDate: Date;
	type: number;
}
