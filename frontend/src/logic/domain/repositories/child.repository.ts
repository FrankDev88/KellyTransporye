import { Child } from "../models/Child";
import type { CreateChildCredentials } from "../schemas/childSchema";
import { Result } from "../models/Result";

export interface ChildRepository {
    createChild(data: CreateChildCredentials): Promise<Result<{ id: string; message: string }>>;
    getChildren(): Promise<Result<Child[]>>;
}
