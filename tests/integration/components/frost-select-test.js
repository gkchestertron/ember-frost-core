import {expect} from 'chai'
import {expectSelectWithState} from 'dummy/tests/helpers/ember-frost-core'
import {integration} from 'dummy/tests/helpers/ember-test-utils/describe-component'
import Ember from 'ember'
const {$} = Ember
import keyCodes from 'ember-frost-core/utils/keycodes'
const {ESCAPE, SPACE, TAB} = keyCodes
import {$hook, initialize} from 'ember-hook'
import {describeComponent, it} from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import {afterEach, beforeEach, describe} from 'mocha'
import sinon from 'sinon'

/**
 * Focus on next focusable element
 * @param {jQuery} $element - element to find next focusable sibling of
 */
function focusNext ($element) {
  const $focusableElements = $element.nextAll(':not([tabindex=-1])')
  const $firstFocusableElement = $focusableElements.first()

  // We must use jQuery's focusin() method for Ember event to fire and the
  // HTMLElement's focus() method to ensure the element is actually focused
  $firstFocusableElement.focusin()[0].focus()
}

describeComponent(...integration('frost-select'), function () {
  let onBlur, onChange, onFocus, sandbox

  beforeEach(function () {
    initialize()
    sandbox = sinon.sandbox.create()

    onBlur = sandbox.spy()
    onChange = sandbox.spy()
    onFocus = sandbox.spy()

    this.setProperties({
      hook: 'select',
      onBlur,
      onFocus,
      onChange,
      tabIndex: 0 // This is the default
    })

    this.render(hbs`
      {{frost-select-outlet}}
      {{input hook='pre'}}
      {{frost-select
        data=data
        disabled=disabled
        error=error
        hook=hook
        onBlur=onBlur
        onChange=onChange
        onFocus=onFocus
        tabIndex=tabIndex
      }}
      {{input hook='post'}}
    `)
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('when data not present', function () {
    it('renders as expected', function () {
      expectSelectWithState('select', {
        focused: false
      })

      expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
      expect(onChange.callCount, 'OnChange is not called').to.equal(0)
      expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
    })

    describe('click on component', function () {
      beforeEach(function () {
        // In a real browser when you click on the select with your mouse a
        // focusin event is fired on the component. However when using jQuery's
        // click() method the focusin is not fired so we are programitcally
        // triggering that in this test.

        $hook('select').click().trigger('focusin')
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: true,
          items: [],
          opened: true
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is called once').to.equal(1)
      })

      describe('when escape key pressed', function () {
        beforeEach(function () {
          [onBlur, onChange, onFocus].forEach((func) => func.reset())

          $(document)
            .trigger(
              $.Event('keydown', {
                keyCode: ESCAPE
              })
            )
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            focused: true
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })
    })

    describe('tab into component', function () {
      beforeEach(function () {
        // In case you are wondering what the hell is going on here there is no
        // way to trigger a generic tab event on the document to move focus on to
        // the next element for browser security reasons. So our approach is to
        // simply bind a keypress event to the element before the select, which
        // adds focus to the next element in the DOM when it receives a tab,
        // simulating what would happen in a real world scenario. We then trigger
        // a tab event on this input and ensure the our select receives focus.

        $hook('pre')
          .on('keypress', function (e) {
            if (e.keyCode === TAB) {
              focusNext($(this))
            }
          })
          .focus()
          .trigger(
            $.Event('keypress', {
              keyCode: TAB
            })
          )
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: true
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)

        // NOTE: called twice because focusin() and focus() are called in test
        expect(onFocus.callCount, 'onFocus is called once').to.equal(2)
      })
    })

    describe('programatically focus component', function () {
      beforeEach(function () {
        // We must use jQuery's focusin() method for Ember event to fire and the
        // HTMLElement's focus() method to ensure the element is actually focused
        $hook('select').focusin()[0].focus()
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: true
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)

        // NOTE: called twice because focusin() and focus() are called in test
        expect(onFocus.callCount, 'onFocus is called once').to.equal(2)
      })

      describe('programitcally blur component', function () {
        beforeEach(function () {
          [onBlur, onChange, onFocus].forEach((func) => func.reset())
          $hook('select').blur()
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            focused: false
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(1)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })

      describe('when space bar pressed', function () {
        beforeEach(function () {
          [onBlur, onChange, onFocus].forEach((func) => func.reset())

          $hook('select')
            .trigger(
              $.Event('keypress', {
                keyCode: SPACE
              })
            )
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            focused: true,
            items: [],
            opened: true
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })

        describe('programitcally blur component', function () {
          beforeEach(function () {
            [onBlur, onChange, onFocus].forEach((func) => func.reset())
            $hook('select').blur()
          })

          it('renders as expected', function () {
            expectSelectWithState('select', {
              focused: false
            })

            expect(onBlur.callCount, 'onBlur is not called').to.equal(1)
            expect(onChange.callCount, 'OnChange is not called').to.equal(0)
            expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
          })
        })

        describe('when escape key pressed', function () {
          beforeEach(function () {
            [onBlur, onChange, onFocus].forEach((func) => func.reset())

            $(document)
              .trigger(
                $.Event('keydown', {
                  keyCode: ESCAPE
                })
              )
          })

          it('renders as expected', function () {
            expectSelectWithState('select', {
              focused: true
            })

            expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
            expect(onChange.callCount, 'OnChange is not called').to.equal(0)
            expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
          })
        })

        describe('when space bar pressed again', function () {
          beforeEach(function () {
            [onBlur, onChange, onFocus].forEach((func) => func.reset())

            $hook('select')
              .trigger(
                $.Event('keypress', {
                  keyCode: SPACE
                })
              )
          })

          it('renders as expected', function () {
            expectSelectWithState('select', {
              focused: true,
              opened: false
            })

            expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
            expect(onChange.callCount, 'OnChange is not called').to.equal(0)
            expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
          })
        })
      })
    })

    describe('when input is disabled', function () {
      beforeEach(function () {
        this.set('disabled', true)
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          disabled: true,
          focused: false
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
      })

      describe('click on component', function () {
        beforeEach(function () {
          // In a real browser when you click on the select with your mouse a
          // focusin event is fired on the component. However when using jQuery's
          // click() method the focusin is not fired so we are programitcally
          // triggering that in this test.

          $hook('select').click().trigger('focusin')
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            disabled: true,
            focused: false
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })

      describe('tab into component', function () {
        beforeEach(function () {
          // In case you are wondering what the hell is going on here there is no
          // way to trigger a generic tab event on the document to move focus on to
          // the next element for browser security reasons. So our approach is to
          // simply bind a keypress event to the element before the select, which
          // adds focus to the next element in the DOM when it receives a tab,
          // simulating what would happen in a real world scenario. We then trigger
          // a tab event on this input and ensure the our select is skipped since
          // it is disabled.

          $hook('pre')
            .on('keypress', function (e) {
              if (e.keyCode === TAB) {
                focusNext($(this))
              }
            })
            .focus()
            .trigger(
              $.Event('keypress', {
                keyCode: TAB
              })
            )
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            disabled: true,
            focused: false
          })

          expect(
            $hook('post')[0],
            'focuses on element after select'
          )
            .to.equal(document.activeElement)

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })
    })

    describe('when input has custom tab index', function () {
      beforeEach(function () {
        this.set('tabIndex', 3)
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: false,
          tabIndex: 3
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
      })
    })

    describe('when input has error', function () {
      beforeEach(function () {
        this.set('error', true)
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          error: true,
          focused: false
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
      })
    })
  })

  describe('when data present', function () {
    beforeEach(function () {
      this.set('data', [
        {label: 'Foo', value: 'foo'},
        {label: 'Bar', value: 'bar'}
      ])
    })

    it('renders as expected', function () {
      expectSelectWithState('select', {
        focused: false
      })

      expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
      expect(onChange.callCount, 'OnChange is not called').to.equal(0)
      expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
    })

    describe('click on component', function () {
      beforeEach(function () {
        // In a real browser when you click on the select with your mouse a
        // focusin event is fired on the component. However when using jQuery's
        // click() method the focusin is not fired so we are programitcally
        // triggering that in this test.

        $hook('select').click().trigger('focusin')
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: true,
          focusedItem: 'Foo',
          items: ['Foo', 'Bar'],
          opened: true
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is called once').to.equal(1)
      })

      describe('when escape key pressed', function () {
        beforeEach(function () {
          [onBlur, onChange, onFocus].forEach((func) => func.reset())

          $(document)
            .trigger(
              $.Event('keydown', {
                keyCode: ESCAPE
              })
            )
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            focused: true
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })
    })

    describe('tab into component', function () {
      beforeEach(function () {
        // In case you are wondering what the hell is going on here there is no
        // way to trigger a generic tab event on the document to move focus on to
        // the next element for browser security reasons. So our approach is to
        // simply bind a keypress event to the element before the select, which
        // adds focus to the next element in the DOM when it receives a tab,
        // simulating what would happen in a real world scenario. We then trigger
        // a tab event on this input and ensure the our select receives focus.

        $hook('pre')
          .on('keypress', function (e) {
            if (e.keyCode === TAB) {
              focusNext($(this))
            }
          })
          .focus()
          .trigger(
            $.Event('keypress', {
              keyCode: TAB
            })
          )
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: true
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)

        // NOTE: called twice because focusin() and focus() are called in test
        expect(onFocus.callCount, 'onFocus is called once').to.equal(2)
      })
    })

    describe('programatically focus component', function () {
      beforeEach(function () {
        // We must use jQuery's focusin() method for Ember event to fire and the
        // HTMLElement's focus() method to ensure the element is actually focused
        $hook('select').focusin()[0].focus()
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: true
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)

        // NOTE: called twice because focusin() and focus() are called in test
        expect(onFocus.callCount, 'onFocus is called once').to.equal(2)
      })

      describe('programitcally blur component', function () {
        beforeEach(function () {
          [onBlur, onChange, onFocus].forEach((func) => func.reset())
          $hook('select').blur()
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            focused: false
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(1)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })

      describe('when escape key pressed', function () {
        beforeEach(function () {
          [onBlur, onChange, onFocus].forEach((func) => func.reset())

          $(document)
            .trigger(
              $.Event('keydown', {
                keyCode: ESCAPE
              })
            )
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            focused: true
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })

      describe('when space bar pressed', function () {
        beforeEach(function () {
          [onBlur, onChange, onFocus].forEach((func) => func.reset())

          $hook('select')
            .trigger(
              $.Event('keypress', {
                keyCode: SPACE
              })
            )
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            focused: true,
            focusedItem: 'Foo',
            items: ['Foo', 'Bar'],
            opened: true
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })

        describe('programitcally blur component', function () {
          beforeEach(function () {
            [onBlur, onChange, onFocus].forEach((func) => func.reset())
            $hook('select').blur()
          })

          it('renders as expected', function () {
            expectSelectWithState('select', {
              focused: false
            })

            expect(onBlur.callCount, 'onBlur is not called').to.equal(1)
            expect(onChange.callCount, 'OnChange is not called').to.equal(0)
            expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
          })
        })

        describe('when space bar pressed again', function () {
          beforeEach(function () {
            [onBlur, onChange, onFocus].forEach((func) => func.reset())

            $hook('select')
              .trigger(
                $.Event('keypress', {
                  keyCode: SPACE
                })
              )
          })

          it('renders as expected', function () {
            expectSelectWithState('select', {
              focused: true,
              opened: false
            })

            expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
            expect(onChange.callCount, 'OnChange is not called').to.equal(0)
            expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
          })
        })

        describe('when item selected', function () {
          // TODO: implemente test
        })
      })
    })

    describe('when input is disabled', function () {
      beforeEach(function () {
        this.set('disabled', true)
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          disabled: true,
          focused: false
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
      })

      describe('click on component', function () {
        beforeEach(function () {
          // In a real browser when you click on the select with your mouse a
          // focusin event is fired on the component. However when using jQuery's
          // click() method the focusin is not fired so we are programitcally
          // triggering that in this test.

          $hook('select').click().trigger('focusin')
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            disabled: true,
            focused: false
          })

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })

      describe('tab into component', function () {
        beforeEach(function () {
          // In case you are wondering what the hell is going on here there is no
          // way to trigger a generic tab event on the document to move focus on to
          // the next element for browser security reasons. So our approach is to
          // simply bind a keypress event to the element before the select, which
          // adds focus to the next element in the DOM when it receives a tab,
          // simulating what would happen in a real world scenario. We then trigger
          // a tab event on this input and ensure the our select is skipped since
          // it is disabled.

          $hook('pre')
            .on('keypress', function (e) {
              if (e.keyCode === TAB) {
                focusNext($(this))
              }
            })
            .focus()
            .trigger(
              $.Event('keypress', {
                keyCode: TAB
              })
            )
        })

        it('renders as expected', function () {
          expectSelectWithState('select', {
            disabled: true,
            focused: false
          })

          expect(
            $hook('post')[0],
            'focuses on element after select'
          )
            .to.equal(document.activeElement)

          expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
          expect(onChange.callCount, 'OnChange is not called').to.equal(0)
          expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
        })
      })
    })

    describe('when input has custom tab index', function () {
      beforeEach(function () {
        this.set('tabIndex', 3)
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          focused: false,
          tabIndex: 3
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
      })
    })

    describe('when input has error', function () {
      beforeEach(function () {
        this.set('error', true)
      })

      it('renders as expected', function () {
        expectSelectWithState('select', {
          error: true,
          focused: false
        })

        expect(onBlur.callCount, 'onBlur is not called').to.equal(0)
        expect(onChange.callCount, 'OnChange is not called').to.equal(0)
        expect(onFocus.callCount, 'onFocus is not called').to.equal(0)
      })
    })
  })
})
