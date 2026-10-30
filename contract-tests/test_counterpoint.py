import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path
from itertools import combinations

A='0x'+'1'*40
B='0x'+'2'*40
C='0x'+'3'*40
class Return:
    def __init__(self,data): self.calldata=data
class Public:
    view=staticmethod(lambda fn:fn)
    write=staticmethod(lambda fn:fn)
model_outputs=[]
def prompt(*args,**kwargs): return model_outputs.pop(0)
def run(leader,validator):
    result=leader()
    if not validator(Return(result)): raise ValueError('validator disagreement')
    return result
gl=types.SimpleNamespace(UserError=ValueError,Contract=object,public=Public(),message=types.SimpleNamespace(sender_address=A),nondet=types.SimpleNamespace(exec_prompt=prompt),vm=types.SimpleNamespace(Return=Return,run_nondet_unsafe=run))
mod=types.ModuleType('genlayer');mod.gl=gl;mod.TreeMap=dict;mod.u32=int;mod.__all__=['gl','TreeMap','u32'];sys.modules['genlayer']=mod
spec=importlib.util.spec_from_file_location('counterpoint',Path(__file__).parents[1]/'contracts/counterpoint.py');cp=importlib.util.module_from_spec(spec);spec.loader.exec_module(cp)
def voice(letter='A',edges=None):
    return json.dumps({'arguments':[{'title':f'{letter} first idea','text':f'{letter} first original reasoning about a shared exhibition question.'},{'title':f'{letter} second idea','text':f'{letter} second original reasoning about a different exhibition detail.'}],'challenges':edges or []})
def reference_grounded(ids,edges):
    incoming={n:{a for a,b in edges if b==n} for n in ids};accepted=set()
    while True:
        attacked={b for a,b in edges if a in accepted}
        nxt={n for n in ids if incoming[n]<=attacked}
        if nxt==accepted: break
        accepted=nxt
    attacked={b for a,b in edges if a in accepted}
    return {n:'IN' if n in accepted else 'OUT' if n in attacked else 'UNDECIDED' for n in ids}
class GroundedTests(unittest.TestCase):
    def test_all_four_node_directed_frameworks_against_fixed_point(self):
        ids=['A1','A2','B1','B2'];pairs=[(a,b) for a in ids for b in ids if a!=b]
        for mask in range(1<<len(pairs)):
            edges=[p for i,p in enumerate(pairs) if mask>>i&1]
            actual=cp.grounded(ids,edges)
            self.assertEqual(actual['labels'],reference_grounded(ids,edges),mask)
            for a,b in edges:self.assertFalse(actual['labels'][a]=='IN' and actual['labels'][b]=='IN')
    def test_chain_reinstates_initial_argument(self):
        result=cp.grounded(['A1','A2','B1','B2'],[['A2','B1'],['B1','A1']])
        self.assertEqual(result['in'],['A1','A2','B2']);self.assertEqual(len(result['trace']),2)
    def test_cycle_and_downstream_remain_open(self):
        result=cp.grounded(['A1','A2','B1','B2'],[['A1','B1'],['B1','A1'],['A1','B2']])
        self.assertEqual(result['undecided'],['A1','B1','B2']);self.assertEqual(result['knots'],[['A1','B1']])
class ProtocolTests(unittest.TestCase):
    def setUp(self):
        gl.message.sender_address=A;self.contract=cp.Counterpoint();self.contract.rooms={};self.contract.counts={};model_outputs.clear()
        self.key=self.contract.open_room('gallery','Should we reconsider the gallery entrance?',json.dumps([A,B]))
    def state(self):return json.loads(self.contract.get_room(self.key))
    def submit(self,author,raw):gl.message.sender_address=author;return self.contract.submit_voice(self.key,raw)
    def test_ownership_and_immutable_inputs(self):
        before=self.contract.get_room(self.key)
        with self.assertRaises(ValueError):self.submit(C,voice())
        self.assertEqual(before,self.contract.get_room(self.key))
        self.submit(A,voice());self.submit(A,voice())
        with self.assertRaises(ValueError):self.submit(A,voice('changed'))
        with self.assertRaises(ValueError):self.contract.open_room('gallery','A different question for this gallery?',json.dumps([A,B]))
    def test_only_own_source_and_distinct_target(self):
        for edge in [{'source':'B1','target':'A1','basis':'An adequately long explanation.'},{'source':'A1','target':'A1','basis':'An adequately long explanation.'}]:
            with self.assertRaises(ValueError):self.submit(A,voice(edges=[edge]))
    def test_no_mapping_before_every_voice(self):
        self.submit(A,voice())
        with self.assertRaises(ValueError):self.contract.map_room(self.key,'wrong')
        self.assertEqual(self.state()['status'],'COLLECTING')
    def test_no_attack_framework_and_terminal_digest(self):
        self.submit(A,voice());self.submit(B,voice('B'));room=self.state();self.assertEqual(room['status'],'READY')
        with self.assertRaises(ValueError):self.contract.map_room(self.key,'0'*64)
        result=self.contract.map_room(self.key,room['input_digest']);mapped=self.state()
        self.assertEqual(mapped['semantics']['in'],['A1','A2','B1','B2'])
        self.assertEqual(result,self.contract.map_room(self.key,room['input_digest']))
        self.assertEqual(model_outputs,[])
    def assessment_room(self):
        self.submit(A,voice(edges=[{'source':'A1','target':'B1','basis':'This explicitly challenges the opposing conclusion.'}]))
        self.submit(B,voice('B'));room=self.state()
        def finding(kind):return {'findings':[{'kind':kind,'source_quote':room['arguments'][0]['text'],'target_quote':room['arguments'][2]['text'],'reason':'Fixture for testing the semantic boundary only.'}]}
        return room,finding
    def test_validator_compares_labels_not_aggregate(self):
        room,f=self.assessment_room();before=self.contract.get_room(self.key)
        model_outputs.extend([f('REBUTTAL'),f('NOT_ATTACK')])
        with self.assertRaises(ValueError):self.contract.map_room(self.key,room['input_digest'])
        self.assertEqual(before,self.contract.get_room(self.key))
    def test_unclear_is_review_without_a_labelled_graph(self):
        room,f=self.assessment_room();model_outputs.extend([f('UNCLEAR'),f('UNCLEAR')]);self.contract.map_room(self.key,room['input_digest'])
        self.assertEqual(self.state()['status'],'REVIEW');self.assertIsNone(self.state()['semantics'])
    def test_quotes_must_belong_to_original_argument(self):
        room,f=self.assessment_room();candidate=f('REBUTTAL');candidate['findings'][0]['source_quote']='Invented support is invalid.';model_outputs.append(candidate)
        with self.assertRaises(ValueError):self.contract.map_room(self.key,room['input_digest'])
        self.assertEqual(self.state()['status'],'READY')
    def test_duplicate_json_keys_rejected(self):
        with self.assertRaises(ValueError):cp.load_json('{"x":1,"x":2}')
    def test_models_cannot_skip_a_challenge(self):
        room,f=self.assessment_room()
        with self.assertRaises(ValueError):cp.parse_findings({'findings':[]},room['arguments'],room['challenges'])
    def test_validator_allows_different_reason_wording(self):
        room,f=self.assessment_room();a=f('NOT_ATTACK');b=f('NOT_ATTACK');b['findings'][0]['reason']='Another contextual explanation of this same classification.'
        model_outputs.extend([a,b]);self.contract.map_room(self.key,room['input_digest']);self.assertEqual(self.state()['status'],'MAPPED')
if __name__=='__main__':unittest.main()
