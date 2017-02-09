const expect = require('expect');
const Workflow = require('../lib/workflow');

describe('Workflow', () => {
  let log;

  beforeEach(() => {
    log = {
      info: expect.createSpy()
    };
  });

  describe('matches', () => {
    it('is truthy for matching event', () => {
      const workflow = new Workflow(['issues'], log);
      expect(workflow.matches({event: 'issues', payload: {}})).toBeTruthy();
    });

    it('is truthy for multiple events', () => {
      const workflow = new Workflow(['issues', 'pull_request'], log);
      expect(workflow.matches({event: 'pull_request', payload: {}})).toBeTruthy();
    });

    it('is truthy for event with action', () => {
      const workflow = new Workflow(['issues.opened'], log);
      expect(
        workflow.matches({event: 'issues', payload: {action: 'opened'}})
      ).toBeTruthy();
    });

    it('is truthy for multiple events with action', () => {
      const workflow = new Workflow(['issues.opened', 'issues.labeled'], log);
      expect(
        workflow.matches({event: 'issues', payload: {action: 'labeled'}})
      ).toBeTruthy();
    });

    it('is falsy for different event', () => {
      const workflow = new Workflow(['issues'], log);
      expect(workflow.matches({event: 'pull_request', payload: {}})).toBeFalsy();
    });

    it('is falsy for different action', () => {
      const workflow = new Workflow(['issues.opened'], log);
      expect(
        workflow.matches({event: 'issues', payload: {action: 'labeled'}})
      ).toBeFalsy();
    });

    describe('logging', () => {
      let workflow;

      beforeEach(() => {
        workflow = new Workflow(['issues.opened', 'issues.labeled'], log);
      });

      it('writes to info for a matching event', () => {
        const event = {event: 'issues', payload: {action: 'labeled'}};
        workflow.matches(event);

        expect(log.info.calls.length).toEqual(1);
        expect(log.info.calls[0].arguments[0]).toMatch(/matched.*issues.labeled/);
        expect(log.info.calls[0].arguments[1]).toEqual(event);
      });

      it('does not write for an unmatched event', () => {
        const event = {event: 'pull_request', payload: {}};
        workflow.matches(event);

        expect(log.info.calls.length).toEqual(0);
      });
    });
  });
});
