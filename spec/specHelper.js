import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import chai from 'chai';
import td from "testdouble";

chai.use(sinonChai);
global.expect = chai.expect;
global.sinon = sinon;
global.chai = chai;
global.td = td;
