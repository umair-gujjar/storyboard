/* eslint-disable react/prop-types */

var AttachmentLine;
var ColoredText;
var Icon;
var MainStoryTitle;
var PureRenderMixin;
var React;
var ReactRedux;
var RepetitionLine;
var Spinner;
var ConnectedStory;
var TIME_LENGTH;
var _;
var Story;
var _quickFind;
var _style;
var _styleMainTitle;
var actions;
var ansiColors;
var chalk;
var connect;
var deserialize;
var isDark;
var k;
var mapDispatchToProps;
var mapStateToProps;
var moment;
var ref;
var timm;
var tinycolor;
var treeLines;

_ = require('../../vendor/lodash');

React = require('react');

ReactRedux = require('react-redux');

PureRenderMixin = require('react-addons-pure-render-mixin');

timm = require('timm');

tinycolor = require('tinycolor2');

moment = require('moment');

chalk = require('chalk');

ref = require('giu'), Icon = ref.Icon, Spinner = ref.Spinner, isDark = ref.isDark;

ColoredText = require('./030-coloredText').default;

actions = require('../actions/actions');

ansiColors = require('../../gral/ansiColors');

treeLines = require('../../gral/treeLines')["default"];

deserialize = require('../../gral/serialize').deserialize;

k = require('../../gral/constants');

_quickFind = (msg, quickFind) => {
  var re;
  if (!quickFind.length) {
    return msg;
  }
  re = new RegExp(quickFind, 'gi');
  msg = msg.replace(re, chalk.bgYellow("$1"));
  return msg;
};

mapStateToProps = state => ({
  timeType: state.settings.timeType,
  fShowClosedActions: state.settings.fShowClosedActions,
  quickFind: state.stories.quickFind
});

mapDispatchToProps = dispatch => ({
  setTimeType: function (timeType) {
    return dispatch(actions.setTimeType(timeType));
  },

  onToggleExpanded: function (pathStr) {
    return dispatch(actions.toggleExpanded(pathStr));
  },

  onToggleHierarchical: function (pathStr) {
    return dispatch(actions.toggleHierarchical(pathStr));
  },

  onToggleAttachment: function (pathStr, recordId) {
    return dispatch(actions.toggleAttachment(pathStr, recordId));
  }
});

Story = React.createClass({
  displayName: 'Story',
  propTypes: {
    story: React.PropTypes.object.isRequired,
    level: React.PropTypes.number.isRequired,
    seqFullRefresh: React.PropTypes.number.isRequired,
    colors: React.PropTypes.object.isRequired,
    timeType: React.PropTypes.string.isRequired,
    fShowClosedActions: React.PropTypes.bool.isRequired,
    quickFind: React.PropTypes.string.isRequired,
    setTimeType: React.PropTypes.func.isRequired,
    onToggleExpanded: React.PropTypes.func.isRequired,
    onToggleHierarchical: React.PropTypes.func.isRequired,
    onToggleAttachment: React.PropTypes.func.isRequired
  },
  render: function () {
    if (this.props.story.fWrapper) {
      return <div>{this.renderRecords()}</div>;
    }
    if (this.props.level === 1) {
      return this.renderRootStory();
    }
    return this.renderNormalStory();
  },
  renderRootStory: function () {
    var colors;
    var level;
    var ref1;
    var story;
    ref1 = this.props, level = ref1.level, story = ref1.story, colors = ref1.colors;
    return <div className="rootStory" style={_style.outer(level, story, colors)}><MainStoryTitle title={story.title} numRecords={story.numRecords} fHierarchical={story.fHierarchical} fExpanded={story.fExpanded} onToggleExpanded={this.toggleExpanded} onToggleHierarchical={this.toggleHierarchical} />{this.renderRecords()}</div>;
  },
  renderNormalStory: function () {
    var colors;
    var fOpen;
    var level;
    var ref1;
    var story;
    var title;
    ref1 = this.props, level = ref1.level, story = ref1.story, colors = ref1.colors;
    title = story.title, fOpen = story.fOpen;
    return <div className="story" style={_style.outer(level, story, colors)}><Line record={story} level={this.props.level} fDirectChild={false} timeType={this.props.timeType} setTimeType={this.props.setTimeType} quickFind={this.props.quickFind} onToggleExpanded={this.toggleExpanded} onToggleHierarchical={this.toggleHierarchical} seqFullRefresh={this.props.seqFullRefresh} colors={colors} />{this.renderRecords()}</div>;
  },
  renderRecords: function () {
    var el;
    var i;
    var len;
    var out;
    var record;
    var records;
    if (!this.props.story.fExpanded) {
      return;
    }
    records = this.prepareRecords(this.props.story.records);
    out = [];
    for (i = 0, len = records.length; i < len; i++) {
      record = records[i];
      el = this.renderRecord(record);
      if (el == null) {
        continue;
      }
      out.push(el);
      if (record.objExpanded && record.obj != null) {
        out = out.concat(this.renderAttachment(record));
      }
      if (record.repetitions) {
        out.push(this.renderRepetitions(record));
      }
    }
    return out;
  },
  renderRecord: function (record) {
    var action;
    var fDirectChild;
    var fStoryObject;
    var id;
    var obj;
    var objExpanded;
    var storyId;
    id = record.id, fStoryObject = record.fStoryObject, storyId = record.storyId, obj = record.obj, objExpanded = record.objExpanded, action = record.action;
    fDirectChild = storyId === this.props.story.storyId;
    if (fStoryObject) {
      return <Story
        key={storyId}
        story={record}
        level={this.props.level + 1}
        seqFullRefresh={this.props.seqFullRefresh} colors={this.props.colors}
        timeType={this.props.timeType}
        fShowClosedActions={this.props.fShowClosedActions}
        quickFind={this.props.quickFind}
        setTimeType={this.props.setTimeType}
        onToggleExpanded={this.props.onToggleExpanded}
        onToggleHierarchical={this.props.onToggleHierarchical}
        onToggleAttachment={this.props.onToggleAttachment}
      />;
    } else {
      if (fDirectChild) {
        if (action === 'CREATED') {
          return;
        }
        if (!this.props.fShowClosedActions && action === 'CLOSED') {
          return;
        }
      }
      return <Line key={storyId + "_" + id} record={record} level={this.props.level} fDirectChild={fDirectChild} timeType={this.props.timeType} setTimeType={this.props.setTimeType} quickFind={this.props.quickFind} onToggleAttachment={this.toggleAttachment} seqFullRefresh={this.props.seqFullRefresh} colors={this.props.colors} />;
    }
    return out;
  },
  renderAttachment: function (record) {
    var id;
    var lines;
    var obj;
    var objOptions;
    var props;
    var storyId;
    var version;
    storyId = record.storyId, id = record.id, obj = record.obj, objOptions = record.objOptions, version = record.version;
    props = _.pick(this.props, ['level', 'timeType', 'setTimeType', 'quickFind', 'seqFullRefresh', 'colors']);
    lines = version >= 2 ? treeLines(deserialize(obj), objOptions) : obj;
    return lines.map((line, idx) => <AttachmentLine {...Object.assign({
      "key": storyId + "_" + id + "_" + idx,
      "record": record
    }, props, {
      "msg": line
    })} />);
  },
  renderRepetitions: function (record) {
    var id;
    var props;
    var storyId;
    storyId = record.storyId, id = record.id;
    props = _.pick(this.props, ['level', 'timeType', 'setTimeType', 'quickFind', 'seqFullRefresh', 'colors']);
    return <RepetitionLine {...Object.assign({
      "key": storyId + "_" + id + "_repetitions",
      "record": record
    }, props)} />;
  },
  toggleExpanded: function () {
    return this.props.onToggleExpanded(this.props.story.pathStr);
  },
  toggleHierarchical: function () {
    return this.props.onToggleHierarchical(this.props.story.pathStr);
  },
  toggleAttachment: function (recordId) {
    return this.props.onToggleAttachment(this.props.story.pathStr, recordId);
  },
  prepareRecords: function (records) {
    var out;
    if (this.props.story.fHierarchical) {
      out = _.sortBy(records, 't');
    } else {
      out = this.flatten(records);
    }
    return out;
  },
  flatten: function (records, level) {
    var i;
    var len;
    var out;
    var record;
    if (level == null) {
      level = 0;
    }
    out = [];
    for (i = 0, len = records.length; i < len; i++) {
      record = records[i];
      if (record.fStoryObject) {
        out = out.concat(this.flatten(record.records, level + 1));
      } else {
        out.push(record);
      }
    }
    if (level === 0) {
      out = _.sortBy(out, 't');
    }
    return out;
  }
});

_style = {
  outer: function (level, story, colors) {
    return {
      backgroundColor: story.fServer ? colors.colorServerBg : colors.colorClientBg,
      color: story.fServer ? colors.colorServerFg : colors.colorClientFg,
      marginBottom: level <= 1 ? 10 : void 0,
      padding: level <= 1 ? 2 : void 0
    };
  }
};

connect = ReactRedux.connect(mapStateToProps, mapDispatchToProps);

ConnectedStory = connect(Story);

MainStoryTitle = React.createClass({
  displayName: 'MainStoryTitle',
  mixins: [PureRenderMixin],
  propTypes: {
    title: React.PropTypes.string.isRequired,
    numRecords: React.PropTypes.number.isRequired,
    fHierarchical: React.PropTypes.bool.isRequired,
    fExpanded: React.PropTypes.bool.isRequired,
    onToggleExpanded: React.PropTypes.func.isRequired,
    onToggleHierarchical: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    return {
      fHovered: false
    };
  },
  render: function () {
    return <div className="rootStoryTitle" style={_styleMainTitle.outer} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>{this.renderCaret()}<span style={_styleMainTitle.title} onClick={this.props.onToggleExpanded}>{this.props.title.toUpperCase()} <span style={_styleMainTitle.numRecords}>[{this.props.numRecords}]</span></span>{this.renderToggleHierarchical()}</div>;
  },
  renderCaret: function () {
    var icon;
    if (!this.state.fHovered) {
      return;
    }
    icon = this.props.fExpanded ? 'caret-down' : 'caret-right';
    return <span onClick={this.props.onToggleExpanded} style={_styleMainTitle.caret.outer}><Icon icon={icon} style={_styleMainTitle.caret.icon} /></span>;
  },
  renderToggleHierarchical: function () {
    if (!this.state.fHovered) {
      return;
    }
    return <HierarchicalToggle fHierarchical={this.props.fHierarchical} onToggleHierarchical={this.props.onToggleHierarchical} fFloat={true} />;
  },
  onMouseEnter: function () {
    return this.setState({
      fHovered: true
    });
  },
  onMouseLeave: function () {
    return this.setState({
      fHovered: false
    });
  }
});

_styleMainTitle = {
  outer: {
    textAlign: 'center',
    marginBottom: 5,
    cursor: 'pointer'
  },
  title: {
    fontWeight: 900,
    letterSpacing: 3
  },
  numRecords: {
    color: 'darkgrey'
  },
  caret: {
    outer: {
      display: 'inline-block',
      position: 'absolute'
    },
    icon: {
      display: 'inline-block',
      position: 'absolute',
      right: 6,
      top: 2
    }
  }
};

AttachmentLine = React.createClass({
  displayName: 'AttachmentLine',
  mixins: [PureRenderMixin],
  propTypes: {
    record: React.PropTypes.object.isRequired,
    level: React.PropTypes.number.isRequired,
    timeType: React.PropTypes.string.isRequired,
    setTimeType: React.PropTypes.func.isRequired,
    seqFullRefresh: React.PropTypes.number.isRequired,
    msg: React.PropTypes.string.isRequired,
    quickFind: React.PropTypes.string.isRequired,
    colors: React.PropTypes.object.isRequired
  },
  render: function () {
    var colors;
    var msg;
    var record;
    var ref1;
    var style;
    ref1 = this.props, record = ref1.record, msg = ref1.msg, colors = ref1.colors;
    style = styleLine.log(record, colors);
    msg = _quickFind(msg, this.props.quickFind);
    return <div className="attachmentLine allowUserSelect" style={style}><Time fShowFull={false} timeType={this.props.timeType} setTimeType={this.props.setTimeType} seqFullRefresh={this.props.seqFullRefresh} /><Src src={record.src} /><Severity level={record.objLevel} /><Indent level={this.props.level} /><CaretOrSpace /><ColoredText text={'  ' + msg} /></div>;
  }
});

RepetitionLine = React.createClass({
  displayName: 'RepetitionLine',
  mixins: [PureRenderMixin],
  propTypes: {
    record: React.PropTypes.object.isRequired,
    level: React.PropTypes.number.isRequired,
    timeType: React.PropTypes.string.isRequired,
    setTimeType: React.PropTypes.func.isRequired,
    seqFullRefresh: React.PropTypes.number.isRequired,
    quickFind: React.PropTypes.string.isRequired,
    colors: React.PropTypes.object.isRequired
  },
  render: function () {
    var colors;
    var level;
    var msg;
    var record;
    var ref1;
    var seqFullRefresh;
    var setTimeType;
    var style;
    var timeType;
    ref1 = this.props, record = ref1.record, level = ref1.level, timeType = ref1.timeType, setTimeType = ref1.setTimeType, seqFullRefresh = ref1.seqFullRefresh, colors = ref1.colors;
    style = styleLine.log(record, colors);
    msg = " x" + (record.repetitions + 1) + ", latest: ";
    msg = _quickFind(msg, this.props.quickFind);
    return <div className="attachmentLine allowUserSelect" style={style}><Time fShowFull={false} timeType={timeType} setTimeType={setTimeType} seqFullRefresh={seqFullRefresh} /><Src /><Severity /><Indent level={level} /><CaretOrSpace /><Icon icon="copy" disabled={true} style={{
        color: 'currentColor'
      }} /><ColoredText text={msg} /><Time t={record.tLastRepetition} fTrim={true} timeType={timeType} setTimeType={setTimeType} seqFullRefresh={seqFullRefresh} /></div>;
  }
});

// ======================================================
// LINE
// ======================================================
class Line extends React.PureComponent {
  static propTypes = {
    record: React.PropTypes.object.isRequired,
    level: React.PropTypes.number.isRequired,
    fDirectChild: React.PropTypes.bool.isRequired,
    timeType: React.PropTypes.string.isRequired,
    setTimeType: React.PropTypes.func.isRequired,
    quickFind: React.PropTypes.string.isRequired,
    onToggleExpanded: React.PropTypes.func,
    onToggleHierarchical: React.PropTypes.func,
    onToggleAttachment: React.PropTypes.func,
    seqFullRefresh: React.PropTypes.number.isRequired,
    colors: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      fHovered: false,
    };
  }

  // -----------------------------------------------------
  render() {
    const { record, fDirectChild, level, colors } = this.props;
    const { fStory, fStoryObject, fServer, fOpen, title, action } = record;
    let { msg } = record;
    if (fStoryObject) msg = title;
    if (fStory) {
      msg = !fDirectChild ? `${title} ` : '';
      if (action) msg += chalk.gray(`[${action}]`);
    }
    const style = fStoryObject
      ? styleLine.titleRow
      : styleLine.log(record, colors);
    const indentLevel = fStoryObject ? level - 1 : level;
    // No animation on dark backgrounds to prevent antialiasing defects
    let className = fStoryObject ? 'storyTitle' : 'log';
    className += ' allowUserSelect';
    const fDarkBg = fServer ? colors.colorServerBgIsDark : colors.colorClientBgIsDark;
    if (!fDarkBg) className += ' fadeIn';
    return (
      <div
        className={className}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        style={style}
      >
        {this.renderTime(record)}
        <Src src={record.src} colors={colors} />
        <Severity level={record.level} colors={colors} />
        <Indent level={indentLevel} />
        {this.renderCaretOrSpace(record)}
        {this.renderMsg(fStoryObject, msg, record.level)}
        {this.renderWarningIcon(record)}
        {fStoryObject && this.renderToggleHierarchical(record)}
        {fStoryObject && fOpen && <Spinner style={styleLine.spinner} />}
        {this.renderAttachmentIcon(record)}
      </div>
    );
  }

  renderMsg(fStoryObject, msg, level) {
    msg = _quickFind(msg, this.props.quickFind);
    if (level >= k.LEVEL_STR_TO_NUM.ERROR) {
      msg = chalk.red.bold(msg);
    } else if (level >= k.LEVEL_STR_TO_NUM.WARN) {
      msg = chalk.red.yellow(msg);
    }
    if (fStoryObject) {
      return <ColoredText text={msg} onClick={this.props.onToggleExpanded} style={styleLine.title} />;
    } else {
      return <ColoredText text={msg} />;
    }
  }

  renderTime(record) {
    var fShowFull;
    var fStoryObject;
    var level;
    var ref1;
    var seqFullRefresh;
    var setTimeType;
    var t;
    var timeType;
    fStoryObject = record.fStoryObject, t = record.t;
    ref1 = this.props, level = ref1.level, timeType = ref1.timeType, setTimeType = ref1.setTimeType, seqFullRefresh = ref1.seqFullRefresh;
    fShowFull = fStoryObject && level <= 2 || level <= 1;
    return <Time t={t} fShowFull={fShowFull} timeType={timeType} setTimeType={setTimeType} seqFullRefresh={seqFullRefresh} />;
  }

  renderCaretOrSpace(record) {
    var fExpanded;
    if (this.props.onToggleExpanded && record.fStoryObject) {
      fExpanded = record.fExpanded;
    }
    return <CaretOrSpace fExpanded={fExpanded} onToggleExpanded={this.props.onToggleExpanded} />;
  }

  renderToggleHierarchical(story) {
    if (!this.props.onToggleHierarchical) {
      return;
    }
    if (!this.state.fHovered) {
      return;
    }
    return <HierarchicalToggle fHierarchical={story.fHierarchical} onToggleHierarchical={this.props.onToggleHierarchical} />;
  }

  renderWarningIcon(record) {
    var fHasError;
    var fHasWarning;
    var title;
    if (record.fExpanded) {
      return;
    }
    fHasWarning = record.fHasWarning, fHasError = record.fHasError;
    if (!(fHasWarning || fHasError)) {
      return;
    }
    title = "Story contains " + (fHasError ? 'an error' : 'a warning');
    return <Icon icon="warning" title={title} onClick={this.props.onToggleExpanded} style={styleLine.warningIcon(fHasError ? 'error' : 'warning')} />;
  }

  renderAttachmentIcon(record) {
    var icon;
    var style;
    if (record.obj == null) {
      return;
    }
    if (record.objIsError) {
      icon = record.objExpanded ? 'folder-open' : 'folder';
      style = timm.set(styleLine.attachmentIcon, 'color', '#cc0000');
    } else {
      icon = record.objExpanded ? 'folder-open-o' : 'folder-o';
      style = styleLine.attachmentIcon;
    }
    return <Icon icon={icon} onClick={this.onClickAttachment} style={style} />;
  }

  onMouseEnter() {
    return this.setState({
      fHovered: true
    });
  }

  onMouseLeave() {
    return this.setState({
      fHovered: false
    });
  }

  onClickAttachment() {
    return this.props.onToggleAttachment(this.props.record.id);
  }
}

// -----------------------------------------------------
const styleLine = {
  titleRow: {
    fontWeight: 900,
    fontFamily: 'Menlo, Consolas, monospace',
    whiteSpace: 'pre',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
  title: {
    cursor: 'pointer'
  },
  log: function (record, colors) {
    var fServer;
    fServer = record.fServer;
    return {
      backgroundColor: fServer ? colors.colorServerBg : colors.colorClientBg,
      color: fServer ? colors.colorServerFg : colors.colorClientFg,
      fontFamily: 'Menlo, Consolas, monospace',
      whiteSpace: 'pre',
      fontWeight: record.fStory && record.action === 'CREATED' ? 900 : void 0,
      overflowX: 'hidden',
      textOverflow: 'ellipsis'
    };
  },
  spinner: {
    marginLeft: 8,
    overflow: 'hidden'
  },
  attachmentIcon: {
    marginLeft: 8,
    cursor: 'pointer',
    display: 'inline'
  },
  warningIcon: function (type) {
    return {
      marginLeft: 8,
      color: type === 'warning' ? '#ff6600' : '#cc0000',
      display: 'inline'
    };
  }
};

// ======================================================
// Time
// ======================================================
TIME_LENGTH = 25;

class Time extends React.PureComponent {
  static propTypes = {
    t: React.PropTypes.number,
    fShowFull: React.PropTypes.bool,
    timeType: React.PropTypes.string.isRequired,
    setTimeType: React.PropTypes.func.isRequired,
    seqFullRefresh: React.PropTypes.number.isRequired,
    fTrim: React.PropTypes.bool,
  };

  render() {
    const { t, fShowFull, timeType, fTrim } = this.props;
    if (t == null) return <span>{_.padEnd('', TIME_LENGTH)}</span>;
    let fRelativeTime = false;
    const m = moment(t);
    const localTime = m.format('YYYY-MM-DD HH:mm:ss.SSS');
    let shownTime;
    if (timeType === 'RELATIVE') {
      shownTime = m.fromNow();
      fRelativeTime = true;
    } else {
      if (timeType === 'UTC') m.utc();
      shownTime = fShowFull
        ? m.format('YYYY-MM-DD HH:mm:ss.SSS')
        : `           ${m.format('HH:mm:ss.SSS')}`;
      if (timeType === 'UTC') shownTime += 'Z';
    }
    shownTime = _.padEnd(shownTime, TIME_LENGTH);
    if (fTrim) shownTime = shownTime.trim();
    return (
      <span
        onClick={this.onClick}
        style={styleTime(fRelativeTime)}
        title={timeType !== 'LOCAL' ? localTime : undefined}
      >
        {shownTime}
      </span>
    );
  }

  onClick = () => {
    let newTimeType;
    if (this.props.timeType === 'LOCAL') {
      newTimeType = 'RELATIVE';
    } else if (this.props.timeType === 'RELATIVE') {
      newTimeType = 'UTC';
    } else {
      newTimeType = 'LOCAL';
    }
    this.props.setTimeType(newTimeType);
  }
}

const styleTime = (fRelativeTime) => ({
  display: 'inline',
  cursor: 'pointer',
  fontStyle: fRelativeTime ? 'italic' : undefined,
});

// ======================================================
// Severity
// ======================================================
class Severity extends React.PureComponent {
  static propTypes = {
    level: React.PropTypes.number,
  };
  render() {
    const { level } = this.props;
    return level != null
      ? <ColoredText text={ansiColors.LEVEL_NUM_TO_COLORED_STR[level]} />
      : <span>      </span>;
  }
}

// ======================================================
// Src
// ======================================================
class Src extends React.PureComponent {
  static propTypes = {
    src: React.PropTypes.string,
  };
  render() {
    const { src } = this.props;
    if (src != null) {
      const srcStr = ansiColors.getSrcChalkColor(src)(_.padStart(`${src} `, 20));
      return <ColoredText text={srcStr} />;
    }
    return <span>{_.repeat(' ', 20)}</span>;
  }
}

// ======================================================
// Indent
// ======================================================
const Indent = ({ level }) => {
  const style = {
    display: 'inline-block',
    width: 20 * (level - 1),
  };
  return <div style={style} />;
};

// ======================================================
// CaretOrSpace
// ======================================================
class CaretOrSpace extends React.PureComponent {
  static propTypes = {
    fExpanded: React.PropTypes.bool,
    onToggleExpanded: React.PropTypes.func,
  };
  render() {
    let icon;
    if (this.props.fExpanded != null) {
      const iconType = this.props.fExpanded ? 'caret-down' : 'caret-right';
      icon = <Icon icon={iconType} onClick={this.props.onToggleExpanded} />;
    }
    return <span style={styleCaretOrSpace}>{icon}</span>;
  }
}

const styleCaretOrSpace = {
  display: 'inline-block',
  width: 30,
  paddingLeft: 10,
  cursor: 'pointer',
};

// ======================================================
// HierarchicalToggle
// ======================================================
class HierarchicalToggle extends React.PureComponent {
  static propTypes = {
    fHierarchical: React.PropTypes.bool.isRequired,
    onToggleHierarchical: React.PropTypes.func.isRequired,
    fFloat: React.PropTypes.bool,
  };

  render() {
    const icon = this.props.fHierarchical ? 'bars' : 'sitemap';
    const text = this.props.fHierarchical ? 'Show flat' : 'Show tree';
    return (
      <span
        onClick={this.props.onToggleHierarchical}
        style={styleHierarchical.outer(this.props.fFloat)}
      >
        <Icon icon={icon} style={styleHierarchical.icon} />
        {text}
      </span>
    );
  }
}

const styleHierarchical = {
  outer: (fFloat) => ({
    position: fFloat ? 'absolute' : undefined,
    marginLeft: 10,
    color: 'darkgrey',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: 'normal',
    fontFamily: 'Menlo, Consolas, monospace',
  }),
  icon: { marginRight: 4 },
};

// ======================================================
export default ConnectedStory;
export { Story as _Story };
