import {BaseFacility} from '../core/BaseFacility';
import {FacilityService} from '../services/facility.service';
export class Tester extends BaseFacility {
    name = '테스트';
    cost = 3700000;
    description = '개쌈@뽕한 실험실';
    adjustFishChance(fish, cleanliness) {
        fish.chance *= 140;
    }
}
FacilityService.registerFacility(Tester);
