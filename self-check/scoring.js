/* Pure functions: derive every result from the current answer snapshot. */
(() => {
  const { questions, dimensions, stages, config } = globalThis.SelfCheckData;
  const meetsStrength = value => value !== null && value + 1e-9 >= config.thresholds.strength;
  function describeDimension(d, items) {
    const copy = config.assessmentCopy;
    if (d.value === null) return { ...copy.insufficient };
    if (d.kind === 'signal') {
      if (d.value >= config.thresholds.watch) return { ...copy.watch, description: d.copy };
      if (items.some(a => a.value >= 2)) return { ...copy.specific };
      return { ...(items.some(a => a.value === 1) ? copy.impulse : copy.steady) };
    }
    if (d.id === 'D') {
      const breaks = items.some(a => a.q.id === 'q1' ? ['A','C'].includes(a.choice.id) : a.value >= 2);
      if (meetsStrength(d.value) && breaks) return { ...copy.disciplineMixed };
      if (meetsStrength(d.value)) return { ...copy.skillStrong, description: d.strongCopy };
      return { ...(d.value < config.thresholds.watch ? copy.disciplineLow : copy.disciplineDeveloping) };
    }
    return meetsStrength(d.value) ? { ...copy.skillStrong, description: d.strongCopy } : { ...(d.value < config.thresholds.watch ? copy.reflectionLow : copy.reflectionDeveloping) };
  }
  function evaluate(answers) {
    const answered = questions.flatMap(q => {
      const choice = q.choices.find(c => c.id === answers[q.id]);
      return choice ? [{ q, choice, value: choice.scores[q.dimension].value }] : [];
    });
    const scores = dimensions.map(d => {
      const items = answered.filter(a => a.choice.scores[d.id]);
      const enough = items.length >= d.minAnswers && (!d.requiredQuestion || items.some(a => a.q.id === d.requiredQuestion));
      const max = items.reduce((n, a) => n + 3 * a.choice.scores[d.id].weight, 0);
      const total = items.reduce((n, a) => n + a.choice.scores[d.id].value * a.choice.scores[d.id].weight, 0);
      const score = { ...d, count: items.length, available: questions.filter(q => q.choices.some(c => c.scores[d.id])).length, value: enough ? total / max * 100 : null };
      return { ...score, assessment: describeDimension(score, items) };
    });
    const breaks = answered.filter(a => a.q.dimension !== 'D' && a.q.dimension !== 'S' && a.value >= 2);
    const preparationIssue = answered.find(a => a.q.id === 'q1' && ['A', 'C'].includes(a.choice.id));
    const eligible = scores.filter(d => d.value !== null);
    const signals = eligible.filter(d => d.kind === 'signal' && d.value >= config.thresholds.watch).sort((a,b) => b.value - a.value);
    const skillsToBuild = eligible.filter(d => d.kind === 'strength' && d.value < config.thresholds.watch).sort((a,b) => a.value-b.value);
    const watch = [...signals, ...skillsToBuild].slice(0,2);
    const strengths = eligible.filter(d => d.kind === 'strength' && meetsStrength(d.value) && (d.id !== 'D' || (!breaks.length && !preparationIssue))).sort((a,b) => b.value-a.value);
    const balanced = eligible.length === dimensions.length && scores.every(d => d.kind === 'signal' ? d.value < config.thresholds.watch : meetsStrength(d.value)) && !breaks.length && !preparationIssue;
    let status = !eligible.length ? 'insufficient' : balanced ? 'balanced' : watch.length ? 'watch' : breaks.length ? 'specific' : 'partial';
    const mainDimension = watch[0];
    let evidence = mainDimension ? answered.filter(a => a.choice.scores[mainDimension.id]) : breaks;
    evidence = [...evidence].sort((a,b) => {
      if (!mainDimension) return b.value-a.value;
      const delta = b.choice.scores[mainDimension.id].value-a.choice.scores[mainDimension.id].value;
      return mainDimension.kind === 'strength' ? -delta : delta;
    });
    const focus = evidence[0];
    let title = config.resultCopy[status];
    const tied = signals.length >= 2 && signals[0].value-signals[1].value <= config.thresholds.tie;
    if (status === 'watch') title = signals.length > 2 ? 'มีหลายช่วงที่ควรระวัง' : tied ? 'มีสองเรื่องที่ควรระวังพอ ๆ กัน' : mainDimension.name;
    const stageResults = stages.map((s,index) => {
      const items = answered.filter(a => a.q.stage === index);
      const total = questions.filter(q => q.stage === index).length;
      const concern = items.some(a => a.q.dimension === 'D' || a.q.dimension === 'S' ? a.value < 2 : a.value >= 2);
      const impulse = items.some(a => !['D','S'].includes(a.q.dimension) && a.value === 1);
      return { ...s, count: items.length, total, state: !items.length ? 'empty' : concern ? 'watch' : impulse ? 'impulse' : 'steady', label: !items.length ? 'ยังไม่ได้ตอบช่วงนี้' : concern ? 'มีจุดที่ควรกลับไปดู' : impulse ? 'อยากเปลี่ยน แต่ยังทำตามแผน' : index === 5 ? 'ได้กลับมาทบทวน' : 'ยังทำตามแผนได้' };
    });
    // A specific strength is permissible only with direct evidence from a whole stage.
    let specificStrength = null;
    const discipline = scores.find(d => d.id === 'D');
    if (meetsStrength(discipline.value) && (breaks.length || preparationIssue)) {
      const steadyStage = [4,3,1,2].find(index => stageResults[index].count === stageResults[index].total && ['steady','impulse'].includes(stageResults[index].state));
      if (steadyStage !== undefined) specificStrength = { name: `${stages[steadyStage].name} ยังทำตามแผนได้`, copy: 'จากที่ตอบมา ช่วงนี้คุณยังใช้กฎเดิมได้ ลองดูว่าอะไรช่วยให้ทำได้ แล้วเก็บสิ่งนั้นไว้ใช้ต่อ' };
    }
    const body = status === 'watch' ? mainDimension.copy : status === 'specific' ? 'มีคำตอบที่บอกว่าเคยทำต่างจากแผน แม้จะไม่ได้เป็นแบบนั้นทุกข้อ ลองย้อนดูว่าตอนนั้นเกิดอะไรขึ้น' : config.resultCopy[`${status}Body`];
    return { scores, status, title, body, watch, strengths, specificStrength, tied, focus, answered: answered.length, stageResults, observe: status === 'balanced' ? 'อะไรช่วยให้คุณทำตามแผนได้ในครั้งนี้ ลองจดไว้ใช้ในครั้งหน้าดีไหม?' : status === 'insufficient' ? config.genericObserve : focus?.choice.observe || focus?.q.observe || config.genericObserve };
  }
  function productUrl(incoming, target = config.productUrl, supplemental = {}) {
    const url = new URL(target);
    const source = new URL(incoming);
    (config.trackingKeys || config.utmKeys).forEach(key => {
      const value = source.searchParams.get(key) || supplemental[key];
      if (value) url.searchParams.set(key, value);
    });
    return url.href;
  }
  globalThis.SelfCheckScoring = { evaluate, productUrl };
})();
