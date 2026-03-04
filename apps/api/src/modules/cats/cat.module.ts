import { Module } from "@nestjs/common";
import { CatController } from "src/modules/cats/cat.controller";
import { CatService } from "src/modules/cats/cat.service";

@Module({
    controllers: [CatController],
    providers: [CatService]
})

export class CatModule {}