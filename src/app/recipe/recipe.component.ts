import { DirectionModel } from './../Models/direction-model';
import { IngredientModel, IngredientAmountModel } from './../Models/ingredient-model';
//import { Recipe } from './../recipe';
import { RecipeDirectionsService } from '../Services/recipe-directions.service';
import { RecipeIngredientsService } from '../Services/recipe-ingredients.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.sass']
})
export class RecipeComponent implements OnInit, OnChanges {
  @Input() id: number;
  @Input() name: string;
  @Input() variant: string;
  allIngredients: IngredientModel[];
  allDirections: DirectionModel[];

  constructor(private ingredientService: RecipeIngredientsService, private directionService: RecipeDirectionsService) { }

  ngOnInit(): void {
    this.updateIngredients(this.id);
    this.updateDirections(this.id);
  }

  ngOnChanges(): void {
    this.updateIngredients(this.id);
    this.updateDirections(this.id);
  }

  private updateIngredients(id) {
    this.ingredientService.GetIngredients(id)
    .pipe(
      map(response => {
      let allIngredients = response.records.map(
        ingredientObj => {
          // for(let i in ingredientObj.fields) {
          //   console.log(i + "(" + ingredientObj.fields[i] + ")");
          // }
          // console.log("Name(" + ingredientObj.fields["Ingredient Name"] + ")"); //debug
          // console.log("Order(" + ingredientObj.fields["Order"] + ")"); //debug
          // console.log("Quantity(" + ingredientObj.fields["Quantity"] + ")"); //debug

          let model: IngredientModel = {
            order: ingredientObj.fields["Order"],
            name: ingredientObj.fields["Ingredient Name"][0],
            /*qualifier: ingredientObj.fields[""],*/
            amounts: { }
          }

          let allFields: [string, string][] = [["Cups", "cup"], ["Ounces", "oz"], ["Millilitres", "mL"], ["Quantity", ""], ["Grams", "g"], 
            ["Dashes", ""], ["Barspoons", "barspoons"], ["Teaspoons", "tsp"]];
          for(let i = 0; i < allFields.length; i++) {   
            let fieldName: string = allFields[i][0];
            let value: number = ingredientObj.fields[fieldName];
            //console.log(fieldName + "(" + value + ")"); //debug

            if(isNullOrUndefined(value) === true || isNaN(value) === true) {
              //console.log(fieldName + " is invalid");
              continue;
            }

            model.amounts[fieldName.toLowerCase()] = {units: allFields[i][1], amount: value};
          }

          return model;
        }
      )

      return allIngredients;
    }))
    .subscribe((data: IngredientModel[]) => { this.allIngredients = data; });

    this.allIngredients.sort((a, b) => a.order - b.order);  // Sort
  }

  private updateDirections(id) {
    this.directionService.GetDirections(id)
    .pipe(map(response => {
      let allDirections = response.records.map(
        directionObj => {
          let model = {
            step: directionObj.fields["Step"],
            direction: directionObj.fields["Direction"]
          }

          return model;
        }
      )

      return allDirections;
    }))
    .subscribe((data: any) => { this.allDirections = data; });

    this.allDirections.sort((a, b) => a.step - b.step);  // Sort
  }

  getIngredientDesc(index: number) {
    let ingredient: IngredientModel = this.allIngredients[index];
    let allIngredientAmounts = ingredient.amounts;
    //console.log("Ingredient " + index + ":"); //debug

    let desc: string = "";
    for(let field in allIngredientAmounts) {
      let ingredientAmount: IngredientAmountModel = allIngredientAmounts[field];
      let amount: number = ingredientAmount.amount;
      //console.log(field + "(" + amount + ")");  //debug

      if(isNullOrUndefined(amount) === true || isNaN(amount) === true) {
        console.log(amount + " is invalid");
        continue;
      }

      if(desc.length > 0) {
        desc += " / ";
      }

      let unit: string = ingredientAmount.units;
      desc += amount + " " + unit;
    }

    desc += " " + ingredient.name;
    return desc;
  }
}