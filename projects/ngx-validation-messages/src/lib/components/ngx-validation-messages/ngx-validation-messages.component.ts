import { Component, ContentChildren, Inject, Input, QueryList } from '@angular/core';
import { NgxValidatorNameDirective } from '../../directivies/ngx-validator-name.directive';
import { NGX_VALIDATION_MESSAGES_CONFIG, NgxValidationMessagesConfig } from '../../interface/ngx-validation-messages.config';
import { NgxValidationMessagesService } from '../../service/ngx-validation-messages.service';
import { NgxCustomMessageComponent } from '../ngx-custom-message/ngx-custom-message.component';

/**
 * Component for displaying validation messages, supports child components of type {@link NgxCustomMessageComponent}
 * and html elements with directive {@link NgxValidatorNameDirective} to override validation messages.
 */
@Component({
  selector: 'ngx-validation-messages',
  templateUrl: './ngx-validation-messages.component.html',
  styleUrls: ['./ngx-validation-messages.component.scss']
})
export class NgxValidationMessagesComponent {

  /**
   * Form control for which need to show validation messages.
   */
  @Input('for')
  public formControl: any;

  /**
   * Contains {@link NgxCustomMessageComponent} if present.
   */
  @ContentChildren(NgxCustomMessageComponent)
  public customMsgComponent: QueryList<NgxCustomMessageComponent>;

  /**
   * Contains {@link NgxValidatorNameDirective} if present.
   */
  @ContentChildren(NgxValidatorNameDirective)
  public customMsgDirective: QueryList<NgxValidatorNameDirective>;

  /**
   * Key to get default validation message.
   */
  private defaultError = 'error';

  constructor(@Inject(NGX_VALIDATION_MESSAGES_CONFIG) public ngxValidationConfig: NgxValidationMessagesConfig,
              private ngxValidationMessagesService: NgxValidationMessagesService) {
  }

  /**
   * Get all validation messages for specified form control.
   */
  public get errorMessages(): Array<string> {
    const result: Array<string> = [];

    if (!this.formControl.errors) {
      return result;
    }
    if (this.customMsgComponent && this.customMsgComponent.length > 0) {
      this.processingCustomMessages(this.customMsgComponent);
    }
    if (this.customMsgDirective && this.customMsgDirective.length > 0) {
      this.processingCustomMessages(this.customMsgDirective);
    }

    for (const property in this.formControl.errors) {
      if (this.formControl.errors.hasOwnProperty(property)
        && (this.formControl.touched || this.formControl.dirty)) {
        if (this.formControl.errors[property].customMessages instanceof Array) {
          result.push(...this.formControl.errors[property].customMessages);
          continue;
        }
        if (this.formControl.errors[property].customMessage) {
          result.push(this.formControl.errors[property].customMessage);
          continue;
        }
        const validationMessage: string =
          this.ngxValidationMessagesService.getValidatorErrorMessages(property, this.formControl.errors[property]);
        result.push(validationMessage || this.formControl.errors[property].message
          || this.ngxValidationMessagesService.getValidatorErrorMessages(this.defaultError));
      }
    }
    return result;
  }

  private processingCustomMessages(customMessage: QueryList<any>): void {
    customMessage.forEach((msg: any) => {
      if (!this.formControl.errors[msg.validatorName]) {
        return;
      }
      let message = (msg instanceof NgxCustomMessageComponent)
        ? msg.message.nativeElement.innerText : msg.message;
      message = this.ngxValidationMessagesService.expandParameterizedTemplateMessage(message, this.formControl.errors[msg.validatorName]);

      typeof this.formControl.errors[msg.validatorName] === 'object'
        ? this.formControl.errors[msg.validatorName].customMessage = message
        : this.formControl.errors[msg.validatorName] = {customMessage: message};
    });
  }

}