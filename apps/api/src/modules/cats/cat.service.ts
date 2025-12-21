import { Injectable } from "@nestjs/common";

@Injectable()
export class CatService {
    getCatsCount() : number {
        return 42;
    }
}