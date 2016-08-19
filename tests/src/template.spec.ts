/// <reference path="../../typings/main/ambient/jasmine/index.d.ts" />

declare var DevExpress: any;
declare var $: any;

import {
    Component,
    ElementRef,
    EventEmitter,
    ViewChildren,
    NgZone,
    provide,
    Input,
    Output
} from '@angular/core';

import {
    inject,
    TestComponentBuilder
} from '@angular/core/testing';

import {
    DxComponent,
    DxTemplateHost,
    DxTemplate
} from '../../dist';

// TODO: Try to replace dxButton to Widget ('require' required)
let dxTestWidget = DevExpress.ui.dxButton['inherit']({
    NAME: 'dxTestWidget',
    _render() {
        this.element()[0].classList.add('dx-test-widget');
    }
});

DevExpress.registerComponent('dxTestWidget', dxTestWidget);

@Component({
    selector: 'dx-test-widget',
    template: '',
    providers: [
        provide(DxTemplateHost, { useClass: DxTemplateHost })
    ]
})
export class DxTestWidget extends DxComponent {
    @Input() testTemplate: any;

    @Output() onOptionChanged: EventEmitter<any>;
    @Output() testTemplateChange: EventEmitter<any>;

    constructor(elementRef: ElementRef, ngZone: NgZone, templateHost: DxTemplateHost) {
        super(elementRef, ngZone, templateHost);
        this.widgetClassName = 'dxTestWidget';
        this._events = [
            { subscribe: 'optionChanged', emit: 'onOptionChanged' },
            { subscribe: 'initialized', emit: 'onInitialized' }
        ];

        this._properties = [
            'testTemplate'
        ];

        this.onOptionChanged = new EventEmitter();
        this.testTemplateChange = new EventEmitter();
    }
}

@Component({
    selector: 'test-container-component',
    template: '',
    directives: [DxTestWidget, DxTemplate],
    queries: {
        innerWidgets: new ViewChildren(DxTestWidget)
    }
})
export class TestContainerComponent {
    constructor() {
    }
}


describe('DevExtreme Angular 2 widget', () => {
    let tcb;

    beforeEach(inject([TestComponentBuilder], _tcb => {
        tcb = _tcb;
    }));

    function getWidget(fixture) {
        let widgetElement = fixture.nativeElement.querySelector('.dx-test-widget') || fixture.nativeElement;
        return dxTestWidget.getInstance(widgetElement);
    }

    // spec
    it('should initialize template options of a widget', done => {
       tcb
       .overrideTemplate(TestContainerComponent, `
            <dx-test-widget>
                <div *dxTemplate="let d = data of 'testTemplate'">Template content</div>
            </dx-test-widget>
       `)
       .createAsync(TestContainerComponent)
            .then(fixture => {
                fixture.detectChanges();

                let instance = getWidget(fixture);

                expect(instance.option('testTemplate')).not.toBeUndefined();
                expect(typeof instance.option('testTemplate')).toBe('function');

                done();
            })
            .catch(e => done.fail(e));
    });

    it('should initialize named templates #17', done => {
       tcb
       .overrideTemplate(TestContainerComponent, `
            <dx-test-widget>
                <div *dxTemplate="let d = data of 'testTemplate'">Template content</div>
            </dx-test-widget>
       `)
       .createAsync(TestContainerComponent)
            .then(fixture => {
                fixture.detectChanges();

                let instance = getWidget(fixture),
                    templatesHash = instance.option('_templates');

                expect(templatesHash['testTemplate']).not.toBeUndefined();
                expect(typeof templatesHash['testTemplate'].render).toBe('function');

                done();
            })
            .catch(e => done.fail(e));
    });

    it('should have methods render, dispose, owner and source in template', done => {
        tcb
            .overrideTemplate(TestContainerComponent, `
            <dx-test-widget>
                <div *dxTemplate="let d = data of 'testTemplate'">Template content</div>
            </dx-test-widget>
       `)
            .createAsync(TestContainerComponent)
            .then(fixture => {
                fixture.detectChanges();

                let instance = getWidget(fixture),
                    templatesHash = instance.option('_templates'),
                    template = templatesHash['testTemplate'];

                expect(typeof template.render).toBe('function');
                expect(typeof template.dispose).toBe('function');
                expect(typeof template.owner).toBe('function');
                expect(typeof template.source).toBe('function');

                done();
            })
            .catch(e => done.fail(e));
    });

    it('should have implementation of methods render, dispose, owner and source in template', done => {
        tcb
            .overrideTemplate(TestContainerComponent, `
            <dx-test-widget>
                <div *dxTemplate="let d = data of 'testTemplate'">Template content</div>
            </dx-test-widget>
       `)
            .createAsync(TestContainerComponent)
            .then(fixture => {
                fixture.detectChanges();

                let instance = getWidget(fixture),
                    templatesHash = instance.option('_templates'),
                    template = templatesHash['testTemplate'],
                    itemData = {},
                    itemIndex = 0,
                    itemElement = $('<div>');

                expect(typeof template.render(itemData, itemIndex, itemElement)).toBe('object');
                expect(typeof template.owner()).toBe('object');
                expect(typeof template.source()).toBe('object');
                template.dispose();
                expect(template.owner()).toBeNull();

                done();
            })
            .catch(e => done.fail(e));
    });

    /*
        TODO
        Interpolation doesn't work in the test for unclear reason if we specify it as follows:
        <div *dxTemplate='let d = data of 'testTemplate''>Template content {{d}}</div>
    */
    it('should nonrmalize template function arguments order (#17)', done => {
       tcb
       .overrideTemplate(TestContainerComponent, `
            <dx-test-widget>
                <div *dxTemplate="let d = data of 'testTemplate'">Template content</div>
            </dx-test-widget>
       `)
       .createAsync(TestContainerComponent)
            .then(fixture => {
                fixture.detectChanges();

                let testComponent = fixture.componentInstance,
                    innerComponent = testComponent.innerWidgets.toArray()[0],
                    template = innerComponent.testTemplate,
                    $container = $('<div>');

                expect(template).not.toBeUndefined;

                template($container);
                expect($container.text()).toBe('Template content');

                template('test', $container);
                expect($container.text()).toBe('Template content');

                template($container, 'test');
                expect($container.text()).toBe('Template content');

                template('test', $container, 0);
                expect($container.text()).toBe('Template content');

                done();
            })
            .catch(e => done.fail(e));
    });


});

