export interface FormModule {
    id: number;
    state: boolean;
    createdAt: string;
    deletedAt?: string;
    formId: number;
    moduleId: number;
    form?: string;
    module?: string;
}
