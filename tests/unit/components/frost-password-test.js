import {expect} from 'chai'
import Ember from 'ember'
import Component from 'ember-frost-core/components/frost-component'
import FrostEventsProxy from 'ember-frost-core/mixins/frost-events-proxy'
import {describeComponent} from 'ember-mocha'
import {
  beforeEach,
  describe,
  it
} from 'mocha'

const {run} = Ember

describeComponent(
  'frost-password',
  'Unit: FrostPasswordComponent',
  {
    needs: [
      'component:frost-text'
    ],
    unit: true
  },
  function () {
    let component

    beforeEach(function () {
      component = this.subject()
    })

    it('sets default property values correctly', function () {
      expect(
        component.get('autofocus'),
        'autofocus: false'
      ).to.equal(false)

      expect(
        component.get('disabled'),
        'disabled: "false"'
      ).to.equal(false)

      expect(
        component.get('form'),
        'form: "null"'
      ).to.equal(null)

      expect(
        component.get('hook'),
        'hook: "undefined"'
      ).to.equal(undefined)

      expect(
        component.get('isRevealed'),
        'isRevealed: false'
      ).to.equal(false)

      expect(
        component.get('maxlength'),
        'maxlength: "null"'
      ).to.equal(null)

      expect(
        component.get('placeholder'),
        'placeholder: "null"'
      ).to.equal(null)

      expect(
        component.get('readonly'),
        'readonly: false'
      ).to.equal(false)

      expect(
        component.get('required'),
        'required: false'
      ).to.equal(false)

      expect(
        component.get('revealable'),
        'revealable: false'
      ).to.equal(false)

      expect(
        component.get('selectionDirection'),
        'selectionDirection: "none"'
      ).to.eql('none')

      expect(
        component.get('tabindex'),
        'tabindex: 0'
      ).to.eql(0)

      expect(
        component.get('title'),
        'title: "null"'
      ).to.equal(null)

      expect(
        component.get('type'),
        'type: "password"'
      ).to.eql('password')

      expect(
        component.get('value'),
        'value: "null"'
      ).to.equal(null)
    })

    it('extends the commone frost component', function () {
      expect(
        component instanceof Component,
        'is instance of Frost Component'
      ).to.equal(true)
    })

    it('has the expected Mixins', function () {
      expect(
        FrostEventsProxy.detect(component),
        'FrostEventsProxy Mixin is present'
      ).to.equal(true)
    })

    it('sets dependent keys correctly', function () {
      const revealMessageDependentKeys = [
        'isRevealed'
      ]

      const typeDependentKeys = [
        'isRevealed'
      ]

      expect(
        component.revealMessage._dependentKeys,
        'Dependent keys are correct for revealMessage()'
      ).to.eql(revealMessageDependentKeys)

      expect(
        component.type._dependentKeys,
        'Dependent keys are correct for type()'
      ).to.eql(typeDependentKeys)
    })

    describe('"revealMessage" computed property', function () {
      it('is set to "Hide" when "isRevealed" is true', function () {
        const isRevealed = true

        run(() => component.set('isRevealed', isRevealed))

        expect(
          component.get('revealMessage'),
          'revealMessage: "Hide"'
        ).to.eql('Hide')
      })

      it('is set to "Show" when "isRevealed" is false', function () {
        const isRevealed = false

        run(() => component.set('isRevealed', isRevealed))

        expect(
          component.get('revealMessage'),
          'revealMessage: "Show"'
        ).to.eql('Show')
      })
    })

    describe('"type" computed property', function () {
      it('is set to "text" when "isRevealed" is true', function () {
        const isRevealed = true

        run(() => component.set('isRevealed', isRevealed))

        expect(
          component.get('type'),
          'type: "text"'
        ).to.eql('text')
      })

      it('is set to "password" when "isRevealed" is false', function () {
        const isRevealed = false

        run(() => component.set('isRevealed', isRevealed))

        expect(
          component.get('type'),
          'type: "password"'
        ).to.eql('password')
      })
    })
  }
)
