import { Controller, Get } from "@nestjs/common";
import { CatService } from "src/modules/cats/cat.service";

@Controller("cats")
export class CatController {
    constructor(
        private readonly catService: CatService
    ) {}

    @Get()
    getCats() : number {
        return this.catService.getCatsCount();
    }
}