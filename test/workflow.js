const expect = require('expect');
const Workflow = require('../lib/workflow');

class TestLog {
  constructor() {
    this.log = [];
  }

  dump() {
    return this.log;
  }

  info() {
    this.log.push(Array.prototype.slice.call(arguments));
  }
}

describe('Workflow', () => {
  let log;

  beforeEach(() => {
    log = new TestLog();
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

    describe('logs', () => {
      let workflow;

      beforeEach(() => {
        workflow = new Workflow(['issues.opened', 'issues.labeled'], log);
      });

      it('for a matching event', () => {
        const event = {event: 'issues', payload: {action: 'labeled'}};
        workflow.matches(event);
        const logContents = log.dump();

        expect(logContents.length).toEqual(1);
        expect(logContents[0][0]).toMatch(/matched.*issues.labeled/);
        expect(logContents[0][1]).toEqual(event);
      });
    });
  });
});
