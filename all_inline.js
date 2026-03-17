<\/script>",e=e.removeChild(e.firstChild)):typeof o.is=="string"?e=l.createElement(r,{is:o.is}):(e=l.createElement(r),r==="select"&&(l=e,o.multiple?l.multiple=!0:o.size&&(l.size=o.size))):e=l.createElementNS(e,r),e[tt]=t,e[vo]=o,Pf(e,t,!1,!1),t.stateNode=e;e:{switch(l=Ui(r,o),r){case"dialog":U("cancel",e),U("close",e),n=o;break;case"iframe":case"object":case"embed":U("load",e),n=o;break;case"video":case"audio":for(n=0;n<Xr.length;n++)U(Xr[n],e);n=o;break;case"source":U("error",e),n=o;break;case"img":case"image":case"link":U("error",e),U("load",e),n=o;break;case"details":U("toggle",e),n=o;break;case"input":Bs(e,o),n=Wi(e,o),U("invalid",e);break;case"option":n=o;break;case"select":e._wrapperState={wasMultiple:!!o.multiple},n=Z({},o,{value:void 0}),U("invalid",e);break;case"textarea":Ps(e,o),n=Ii(e,o),U("invalid",e);break;default:n=o}Ai(r,n),s=n;for(i in s)if(s.hasOwnProperty(i)){var a=s[i];i==="style"?uu(e,a):i==="dangerouslySetInnerHTML"?(a=a?a.__html:void 0,a!=null&&su(e,a)):i==="children"?typeof a=="string"?(r!=="textarea"||a!=="")&&ao(e,a):typeof a=="number"&&ao(e,""+a):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(so.hasOwnProperty(i)?a!=null&&i==="onScroll"&&U("scroll",e):a!=null&&El(e,i,a,l))}switch(r){case"input":Eo(e),Ns(e,o,!1);break;case"textarea":Eo(e),zs(e);break;case"option":o.value!=null&&e.setAttribute("value",""+zt(o.value));break;case"select":e.multiple=!!o.multiple,i=o.value,i!=null?vr(e,!!o.multiple,i,!1):o.defaultValue!=null&&vr(e,!!o.multiple,o.defaultValue,!0);break;default:typeof n.onClick=="function"&&(e.onclick=kn)}switch(r){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break e;case"img":o=!0;break e;default:o=!1}}o&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return we(t),null;case 6:if(e&&t.stateNode!=null)jf(e,t,e.memoizedProps,o);else{if(typeof o!="string"&&t.stateNode===null)throw Error(k(166));if(r=Kt(yo.current),Kt(ot.current),Vo(t)){if(o=t.stateNode,r=t.memoizedProps,o[tt]=t,(i=o.nodeValue!==r)&&(e=Ee,e!==null))switch(e.tag){case 3:Io(o.nodeValue,r,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Io(o.nodeValue,r,(e.mode&1)!==0)}i&&(t.flags|=4)}else o=(r.nodeType===9?r:r.ownerDocument).createTextNode(o),o[tt]=t,t.stateNode=o}return we(t),null;case 13:if(Q(Y),o=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(K&&je!==null&&t.mode&1&&!(t.flags&128))Yu(),Lr(),t.flags|=98560,i=!1;else if(i=Vo(t),o!==null&&o.dehydrated!==null){if(e===null){if(!i)throw Error(k(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(k(317));i[tt]=t}else Lr(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;we(t),i=!1}else Ke!==null&&(xl(Ke),Ke=null),i=!0;if(!i)return t.flags&65536?t:null}return t.flags&128?(t.lanes=r,t):(o=o!==null,o!==(e!==null&&e.memoizedState!==null)&&o&&(t.child.flags|=8192,t.mode&1&&(e===null||Y.current&1?ae===0&&(ae=3):ms())),t.updateQueue!==null&&(t.flags|=4),we(t),null);case 4:return $r(),wl(e,t),e===null&&mo(t.stateNode.containerInfo),we(t),null;case 10:return ql(t.type._context),we(t),null;case 17:return Ne(t.type)&&bn(),we(t),null;case 19:if(Q(Y),i=t.memoizedState,i===null)return we(t),null;if(o=(t.flags&128)!==0,l=i.rendering,l===null)if(o)Qr(i,!1);else{if(ae!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(l=Bn(e),l!==null){for(t.flags|=128,Qr(i,!1),o=l.updateQueue,o!==null&&(t.updateQueue=o,t.flags|=4),t.subtreeFlags=0,o=r,r=t.child;r!==null;)i=r,e=o,i.flags&=14680066,l=i.alternate,l===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=l.childLanes,i.lanes=l.lanes,i.child=l.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=l.memoizedProps,i.memoizedState=l.memoizedState,i.updateQueue=l.updateQueue,i.type=l.type,e=l.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),r=r.sibling;return A(Y,Y.current&1|2),t.child}e=e.sibling}i.tail!==null&&oe()>Nr&&(t.flags|=128,o=!0,Qr(i,!1),t.lanes=4194304)}else{if(!o)if(e=Bn(l),e!==null){if(t.flags|=128,o=!0,r=e.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),Qr(i,!0),i.tail===null&&i.tailMode==="hidden"&&!l.alternate&&!K)return we(t),null}else 2*oe()-i.renderingStartTime>Nr&&r!==1073741824&&(t.flags|=128,o=!0,Qr(i,!1),t.lanes=4194304);i.isBackwards?(l.sibling=t.child,t.child=l):(r=i.last,r!==null?r.sibling=l:t.child=l,i.last=l)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=oe(),t.sibling=null,r=Y.current,A(Y,o?r&1|2:r&1),t):(we(t),null);case 22:case 23:return ps(),o=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==o&&(t.flags|=8192),o&&t.mode&1?ze&1073741824&&(we(t),t.subtreeFlags&6&&(t.flags|=8192)):we(t),null;case 24:return null;case 25:return null}throw Error(k(156,t.tag))}function hd(e,t){switch(Jl(t),t.tag){case 1:return Ne(t.type)&&bn(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return $r(),Q(Be),Q(Se),ns(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return os(t),null;case 13:if(Q(Y),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(k(340));Lr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Q(Y),null;case 4:return $r(),null;case 10:return ql(t.type._context),null;case 22:case 23:return ps(),null;case 24:return null;default:return null}}var Qo=!1,ve=!1,dd=typeof WeakSet=="function"?WeakSet:Set,B=null;function mr(e,t){var r=e.ref;if(r!==null)if(typeof r=="function")try{r(null)}catch(o){te(e,t,o)}else r.current=null}function vl(e,t,r){try{r()}catch(o){te(e,t,o)}}var ka=!1;function gd(e,t){if(tl=vn,e=_u(),Kl(e)){if("selectionStart"in e)var r={start:e.selectionStart,end:e.selectionEnd};else e:{r=(r=e.ownerDocument)&&r.defaultView||window;var o=r.getSelection&&r.getSelection();if(o&&o.rangeCount!==0){r=o.anchorNode;var n=o.anchorOffset,i=o.focusNode;o=o.focusOffset;try{r.nodeType,i.nodeType}catch{r=null;break e}var l=0,s=-1,a=-1,d=0,m=0,p=e,g=null;t:for(;;){for(var S;p!==r||n!==0&&p.nodeType!==3||(s=l+n),p!==i||o!==0&&p.nodeType!==3||(a=l+o),p.nodeType===3&&(l+=p.nodeValue.length),(S=p.firstChild)!==null;)g=p,p=S;for(;;){if(p===e)break t;if(g===r&&++d===n&&(s=l),g===i&&++m===o&&(a=l),(S=p.nextSibling)!==null)break;p=g,g=p.parentNode}p=S}r=s===-1||a===-1?null:{start:s,end:a}}else r=null}r=r||{start:0,end:0}}else r=null;for(rl={focusedElem:e,selectionRange:r},vn=!1,B=t;B!==null;)if(t=B,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,B=e;else for(;B!==null;){t=B;try{var b=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(b!==null){var x=b.memoizedProps,P=b.memoizedState,f=t.stateNode,c=f.getSnapshotBeforeUpdate(t.elementType===t.type?x:Ue(t.type,x),P);f.__reactInternalSnapshotBeforeUpdate=c}break;case 3:var h=t.stateNode.containerInfo;h.nodeType===1?h.textContent="":h.nodeType===9&&h.documentElement&&h.removeChild(h.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(k(163))}}catch(v){te(t,t.return,v)}if(e=t.sibling,e!==null){e.return=t.return,B=e;break}B=t.return}return b=ka,ka=!1,b}function no(e,t,r){var o=t.updateQueue;if(o=o!==null?o.lastEffect:null,o!==null){var n=o=o.next;do{if((n.tag&e)===e){var i=n.destroy;n.destroy=void 0,i!==void 0&&vl(t,r,i)}n=n.next}while(n!==o)}}function Gn(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var r=t=t.next;do{if((r.tag&e)===e){var o=r.create;r.destroy=o()}r=r.next}while(r!==t)}}function Sl(e){var t=e.ref;if(t!==null){var r=e.stateNode;switch(e.tag){case 5:e=r;break;default:e=r}typeof t=="function"?t(e):t.current=e}}function Ef(e){var t=e.alternate;t!==null&&(e.alternate=null,Ef(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[tt],delete t[vo],delete t[il],delete t[Yh],delete t[Xh])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Ff(e){return e.tag===5||e.tag===3||e.tag===4}function ba(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Ff(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function yl(e,t,r){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?r.nodeType===8?r.parentNode.insertBefore(e,t):r.insertBefore(e,t):(r.nodeType===8?(t=r.parentNode,t.insertBefore(e,r)):(t=r,t.appendChild(e)),r=r._reactRootContainer,r!=null||t.onclick!==null||(t.onclick=kn));else if(o!==4&&(e=e.child,e!==null))for(yl(e,t,r),e=e.sibling;e!==null;)yl(e,t,r),e=e.sibling}function kl(e,t,r){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?r.insertBefore(e,t):r.appendChild(e);else if(o!==4&&(e=e.child,e!==null))for(kl(e,t,r),e=e.sibling;e!==null;)kl(e,t,r),e=e.sibling}var he=null,Qe=!1;function mt(e,t,r){for(r=r.child;r!==null;)Df(e,t,r),r=r.sibling}function Df(e,t,r){if(rt&&typeof rt.onCommitFiberUnmount=="function")try{rt.onCommitFiberUnmount(Hn,r)}catch{}switch(r.tag){case 5:ve||mr(r,t);case 6:var o=he,n=Qe;he=null,mt(e,t,r),he=o,Qe=n,he!==null&&(Qe?(e=he,r=r.stateNode,e.nodeType===8?e.parentNode.removeChild(r):e.removeChild(r)):he.removeChild(r.stateNode));break;case 18:he!==null&&(Qe?(e=he,r=r.stateNode,e.nodeType===8?yi(e.parentNode,r):e.nodeType===1&&yi(e,r),ho(e)):yi(he,r.stateNode));break;case 4:o=he,n=Qe,he=r.stateNode.containerInfo,Qe=!0,mt(e,t,r),he=o,Qe=n;break;case 0:case 11:case 14:case 15:if(!ve&&(o=r.updateQueue,o!==null&&(o=o.lastEffect,o!==null))){n=o=o.next;do{var i=n,l=i.destroy;i=i.tag,l!==void 0&&(i&2||i&4)&&vl(r,t,l),n=n.next}while(n!==o)}mt(e,t,r);break;case 1:if(!ve&&(mr(r,t),o=r.stateNode,typeof o.componentWillUnmount=="function"))try{o.props=r.memoizedProps,o.state=r.memoizedState,o.componentWillUnmount()}catch(s){te(r,t,s)}mt(e,t,r);break;case 21:mt(e,t,r);break;case 22:r.mode&1?(ve=(o=ve)||r.memoizedState!==null,mt(e,t,r),ve=o):mt(e,t,r);break;default:mt(e,t,r)}}function Ra(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var r=e.stateNode;r===null&&(r=e.stateNode=new dd),t.forEach(function(o){var n=Rd.bind(null,e,o);r.has(o)||(r.add(o),o.then(n,n))})}}function Ae(e,t){var r=t.deletions;if(r!==null)for(var o=0;o<r.length;o++){var n=r[o];try{var i=e,l=t,s=l;e:for(;s!==null;){switch(s.tag){case 5:he=s.stateNode,Qe=!1;break e;case 3:he=s.stateNode.containerInfo,Qe=!0;break e;case 4:he=s.stateNode.containerInfo,Qe=!0;break e}s=s.return}if(he===null)throw Error(k(160));Df(i,l,n),he=null,Qe=!1;var a=n.alternate;a!==null&&(a.return=null),n.return=null}catch(d){te(n,t,d)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)_f(t,e),t=t.sibling}function _f(e,t){var r=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Ae(t,e),Ze(e),o&4){try{no(3,e,e.return),Gn(3,e)}catch(x){te(e,e.return,x)}try{no(5,e,e.return)}catch(x){te(e,e.return,x)}}break;case 1:Ae(t,e),Ze(e),o&512&&r!==null&&mr(r,r.return);break;case 5:if(Ae(t,e),Ze(e),o&512&&r!==null&&mr(r,r.return),e.flags&32){var n=e.stateNode;try{ao(n,"")}catch(x){te(e,e.return,x)}}if(o&4&&(n=e.stateNode,n!=null)){var i=e.memoizedProps,l=r!==null?r.memoizedProps:i,s=e.type,a=e.updateQueue;if(e.updateQueue=null,a!==null)try{s==="input"&&i.type==="radio"&&i.name!=null&&nu(n,i),Ui(s,l);var d=Ui(s,i);for(l=0;l<a.length;l+=2){var m=a[l],p=a[l+1];m==="style"?uu(n,p):m==="dangerouslySetInnerHTML"?su(n,p):m==="children"?ao(n,p):El(n,m,p,d)}switch(s){case"input":Hi(n,i);break;case"textarea":iu(n,i);break;case"select":var g=n._wrapperState.wasMultiple;n._wrapperState.wasMultiple=!!i.multiple;var S=i.value;S!=null?vr(n,!!i.multiple,S,!1):g!==!!i.multiple&&(i.defaultValue!=null?vr(n,!!i.multiple,i.defaultValue,!0):vr(n,!!i.multiple,i.multiple?[]:"",!1))}n[vo]=i}catch(x){te(e,e.return,x)}}break;case 6:if(Ae(t,e),Ze(e),o&4){if(e.stateNode===null)throw Error(k(162));n=e.stateNode,i=e.memoizedProps;try{n.nodeValue=i}catch(x){te(e,e.return,x)}}break;case 3:if(Ae(t,e),Ze(e),o&4&&r!==null&&r.memoizedState.isDehydrated)try{ho(t.containerInfo)}catch(x){te(e,e.return,x)}break;case 4:Ae(t,e),Ze(e);break;case 13:Ae(t,e),Ze(e),n=e.child,n.flags&8192&&(i=n.memoizedState!==null,n.stateNode.isHidden=i,!i||n.alternate!==null&&n.alternate.memoizedState!==null||(ds=oe())),o&4&&Ra(e);break;case 22:if(m=r!==null&&r.memoizedState!==null,e.mode&1?(ve=(d=ve)||m,Ae(t,e),ve=d):Ae(t,e),Ze(e),o&8192){if(d=e.memoizedState!==null,(e.stateNode.isHidden=d)&&!m&&e.mode&1)for(B=e,m=e.child;m!==null;){for(p=B=m;B!==null;){switch(g=B,S=g.child,g.tag){case 0:case 11:case 14:case 15:no(4,g,g.return);break;case 1:mr(g,g.return);var b=g.stateNode;if(typeof b.componentWillUnmount=="function"){o=g,r=g.return;try{t=o,b.props=t.memoizedProps,b.state=t.memoizedState,b.componentWillUnmount()}catch(x){te(o,r,x)}}break;case 5:mr(g,g.return);break;case 22:if(g.memoizedState!==null){xa(p);continue}}S!==null?(S.return=g,B=S):xa(p)}m=m.sibling}e:for(m=null,p=e;;){if(p.tag===5){if(m===null){m=p;try{n=p.stateNode,d?(i=n.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(s=p.stateNode,a=p.memoizedProps.style,l=a!=null&&a.hasOwnProperty("display")?a.display:null,s.style.display=au("display",l))}catch(x){te(e,e.return,x)}}}else if(p.tag===6){if(m===null)try{p.stateNode.nodeValue=d?"":p.memoizedProps}catch(x){te(e,e.return,x)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===e)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===e)break e;for(;p.sibling===null;){if(p.return===null||p.return===e)break e;m===p&&(m=null),p=p.return}m===p&&(m=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Ae(t,e),Ze(e),o&4&&Ra(e);break;case 21:break;default:Ae(t,e),Ze(e)}}function Ze(e){var t=e.flags;if(t&2){try{e:{for(var r=e.return;r!==null;){if(Ff(r)){var o=r;break e}r=r.return}throw Error(k(160))}switch(o.tag){case 5:var n=o.stateNode;o.flags&32&&(ao(n,""),o.flags&=-33);var i=ba(e);kl(e,i,n);break;case 3:case 4:var l=o.stateNode.containerInfo,s=ba(e);yl(e,s,l);break;default:throw Error(k(161))}}catch(a){te(e,e.return,a)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function pd(e,t,r){B=e,Mf(e)}function Mf(e,t,r){for(var o=(e.mode&1)!==0;B!==null;){var n=B,i=n.child;if(n.tag===22&&o){var l=n.memoizedState!==null||Qo;if(!l){var s=n.alternate,a=s!==null&&s.memoizedState!==null||ve;s=Qo;var d=ve;if(Qo=l,(ve=a)&&!d)for(B=n;B!==null;)l=B,a=l.child,l.tag===22&&l.memoizedState!==null?La(n):a!==null?(a.return=l,B=a):La(n);for(;i!==null;)B=i,Mf(i),i=i.sibling;B=n,Qo=s,ve=d}Ta(e)}else n.subtreeFlags&8772&&i!==null?(i.return=n,B=i):Ta(e)}}function Ta(e){for(;B!==null;){var t=B;if(t.flags&8772){var r=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:ve||Gn(5,t);break;case 1:var o=t.stateNode;if(t.flags&4&&!ve)if(r===null)o.componentDidMount();else{var n=t.elementType===t.type?r.memoizedProps:Ue(t.type,r.memoizedProps);o.componentDidUpdate(n,r.memoizedState,o.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&aa(t,i,o);break;case 3:var l=t.updateQueue;if(l!==null){if(r=null,t.child!==null)switch(t.child.tag){case 5:r=t.child.stateNode;break;case 1:r=t.child.stateNode}aa(t,l,r)}break;case 5:var s=t.stateNode;if(r===null&&t.flags&4){r=s;var a=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":a.autoFocus&&r.focus();break;case"img":a.src&&(r.src=a.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var d=t.alternate;if(d!==null){var m=d.memoizedState;if(m!==null){var p=m.dehydrated;p!==null&&ho(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(k(163))}ve||t.flags&512&&Sl(t)}catch(g){te(t,t.return,g)}}if(t===e){B=null;break}if(r=t.sibling,r!==null){r.return=t.return,B=r;break}B=t.return}}function xa(e){for(;B!==null;){var t=B;if(t===e){B=null;break}var r=t.sibling;if(r!==null){r.return=t.return,B=r;break}B=t.return}}function La(e){for(;B!==null;){var t=B;try{switch(t.tag){case 0:case 11:case 15:var r=t.return;try{Gn(4,t)}catch(a){te(t,r,a)}break;case 1:var o=t.stateNode;if(typeof o.componentDidMount=="function"){var n=t.return;try{o.componentDidMount()}catch(a){te(t,n,a)}}var i=t.return;try{Sl(t)}catch(a){te(t,i,a)}break;case 5:var l=t.return;try{Sl(t)}catch(a){te(t,l,a)}}}catch(a){te(t,t.return,a)}if(t===e){B=null;break}var s=t.sibling;if(s!==null){s.return=t.return,B=s;break}B=t.return}}var md=Math.ceil,zn=pt.ReactCurrentDispatcher,cs=pt.ReactCurrentOwner,Oe=pt.ReactCurrentBatchConfig,H=0,fe=null,le=null,de=0,ze=0,wr=Dt(0),ae=0,To=null,qt=0,Jn=0,hs=0,io=null,Ce=null,ds=0,Nr=1/0,lt=null,jn=!1,bl=null,Bt=null,Ko=!1,bt=null,En=0,lo=0,Rl=null,un=-1,fn=0;function Te(){return H&6?oe():un!==-1?un:un=oe()}function Nt(e){return e.mode&1?H&2&&de!==0?de&-de:qh.transition!==null?(fn===0&&(fn=ku()),fn):(e=O,e!==0||(e=window.event,e=e===void 0?16:$u(e.type)),e):1}function Je(e,t,r,o){if(50<lo)throw lo=0,Rl=null,Error(k(185));Lo(e,r,o),(!(H&2)||e!==fe)&&(e===fe&&(!(H&2)&&(Jn|=r),ae===4&&yt(e,de)),Pe(e,o),r===1&&H===0&&!(t.mode&1)&&(Nr=oe()+500,Un&&_t()))}function Pe(e,t){var r=e.callbackNode;qc(e,t);var o=wn(e,e===fe?de:0);if(o===0)r!==null&&Fs(r),e.callbackNode=null,e.callbackPriority=0;else if(t=o&-o,e.callbackPriority!==t){if(r!=null&&Fs(r),t===1)e.tag===0?Zh(Ca.bind(null,e)):Ku(Ca.bind(null,e)),Gh(function(){!(H&6)&&_t()}),r=null;else{switch(bu(o)){case 1:r=Wl;break;case 4:r=Su;break;case 16:r=mn;break;case 536870912:r=yu;break;default:r=mn}r=Qf(r,Wf.bind(null,e))}e.callbackPriority=t,e.callbackNode=r}}function Wf(e,t){if(un=-1,fn=0,H&6)throw Error(k(327));var r=e.callbackNode;if(Rr()&&e.callbackNode!==r)return null;var o=wn(e,e===fe?de:0);if(o===0)return null;if(o&30||o&e.expiredLanes||t)t=Fn(e,o);else{t=o;var n=H;H|=2;var i=Of();(fe!==e||de!==t)&&(lt=null,Nr=oe()+500,Gt(e,t));do try{Sd();break}catch(s){Hf(e,s)}while(!0);Zl(),zn.current=i,H=n,le!==null?t=0:(fe=null,de=0,t=ae)}if(t!==0){if(t===2&&(n=Yi(e),n!==0&&(o=n,t=Tl(e,n))),t===1)throw r=To,Gt(e,0),yt(e,o),Pe(e,oe()),r;if(t===6)yt(e,o);else{if(n=e.current.alternate,!(o&30)&&!wd(n)&&(t=Fn(e,o),t===2&&(i=Yi(e),i!==0&&(o=i,t=Tl(e,i))),t===1))throw r=To,Gt(e,0),yt(e,o),Pe(e,oe()),r;switch(e.finishedWork=n,e.finishedLanes=o,t){case 0:case 1:throw Error(k(345));case 2:Vt(e,Ce,lt);break;case 3:if(yt(e,o),(o&130023424)===o&&(t=ds+500-oe(),10<t)){if(wn(e,0)!==0)break;if(n=e.suspendedLanes,(n&o)!==o){Te(),e.pingedLanes|=e.suspendedLanes&n;break}e.timeoutHandle=nl(Vt.bind(null,e,Ce,lt),t);break}Vt(e,Ce,lt);break;case 4:if(yt(e,o),(o&4194240)===o)break;for(t=e.eventTimes,n=-1;0<o;){var l=31-Ge(o);i=1<<l,l=t[l],l>n&&(n=l),o&=~i}if(o=n,o=oe()-o,o=(120>o?120:480>o?480:1080>o?1080:1920>o?1920:3e3>o?3e3:4320>o?4320:1960*md(o/1960))-o,10<o){e.timeoutHandle=nl(Vt.bind(null,e,Ce,lt),o);break}Vt(e,Ce,lt);break;case 5:Vt(e,Ce,lt);break;default:throw Error(k(329))}}}return Pe(e,oe()),e.callbackNode===r?Wf.bind(null,e):null}function Tl(e,t){var r=io;return e.current.memoizedState.isDehydrated&&(Gt(e,t).flags|=256),e=Fn(e,t),e!==2&&(t=Ce,Ce=r,t!==null&&xl(t)),e}function xl(e){Ce===null?Ce=e:Ce.push.apply(Ce,e)}function wd(e){for(var t=e;;){if(t.flags&16384){var r=t.updateQueue;if(r!==null&&(r=r.stores,r!==null))for(var o=0;o<r.length;o++){var n=r[o],i=n.getSnapshot;n=n.value;try{if(!Ye(i(),n))return!1}catch{return!1}}}if(r=t.child,t.subtreeFlags&16384&&r!==null)r.return=t,t=r;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function yt(e,t){for(t&=~hs,t&=~Jn,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var r=31-Ge(t),o=1<<r;e[r]=-1,t&=~o}}function Ca(e){if(H&6)throw Error(k(327));Rr();var t=wn(e,0);if(!(t&1))return Pe(e,oe()),null;var r=Fn(e,t);if(e.tag!==0&&r===2){var o=Yi(e);o!==0&&(t=o,r=Tl(e,o))}if(r===1)throw r=To,Gt(e,0),yt(e,t),Pe(e,oe()),r;if(r===6)throw Error(k(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Vt(e,Ce,lt),Pe(e,oe()),null}function gs(e,t){var r=H;H|=1;try{return e(t)}finally{H=r,H===0&&(Nr=oe()+500,Un&&_t())}}function er(e){bt!==null&&bt.tag===0&&!(H&6)&&Rr();var t=H;H|=1;var r=Oe.transition,o=O;try{if(Oe.transition=null,O=1,e)return e()}finally{O=o,Oe.transition=r,H=t,!(H&6)&&_t()}}function ps(){ze=wr.current,Q(wr)}function Gt(e,t){e.finishedWork=null,e.finishedLanes=0;var r=e.timeoutHandle;if(r!==-1&&(e.timeoutHandle=-1,Kh(r)),le!==null)for(r=le.return;r!==null;){var o=r;switch(Jl(o),o.tag){case 1:o=o.type.childContextTypes,o!=null&&bn();break;case 3:$r(),Q(Be),Q(Se),ns();break;case 5:os(o);break;case 4:$r();break;case 13:Q(Y);break;case 19:Q(Y);break;case 10:ql(o.type._context);break;case 22:case 23:ps()}r=r.return}if(fe=e,le=e=Pt(e.current,null),de=ze=t,ae=0,To=null,hs=Jn=qt=0,Ce=io=null,Qt!==null){for(t=0;t<Qt.length;t++)if(r=Qt[t],o=r.interleaved,o!==null){r.interleaved=null;var n=o.next,i=r.pending;if(i!==null){var l=i.next;i.next=n,o.next=l}r.pending=o}Qt=null}return e}function Hf(e,t){do{var r=le;try{if(Zl(),ln.current=Pn,Nn){for(var o=X.memoizedState;o!==null;){var n=o.queue;n!==null&&(n.pending=null),o=o.next}Nn=!1}if(Zt=0,ue=se=X=null,oo=!1,ko=0,cs.current=null,r===null||r.return===null){ae=1,To=t,le=null;break}e:{var i=e,l=r.return,s=r,a=t;if(t=de,s.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){var d=a,m=s,p=m.tag;if(!(m.mode&1)&&(p===0||p===11||p===15)){var g=m.alternate;g?(m.updateQueue=g.updateQueue,m.memoizedState=g.memoizedState,m.lanes=g.lanes):(m.updateQueue=null,m.memoizedState=null)}var S=ga(l);if(S!==null){S.flags&=-257,pa(S,l,s,i,t),S.mode&1&&da(i,d,t),t=S,a=d;var b=t.updateQueue;if(b===null){var x=new Set;x.add(a),t.updateQueue=x}else b.add(a);break e}else{if(!(t&1)){da(i,d,t),ms();break e}a=Error(k(426))}}else if(K&&s.mode&1){var P=ga(l);if(P!==null){!(P.flags&65536)&&(P.flags|=256),pa(P,l,s,i,t),Yl(Br(a,s));break e}}i=a=Br(a,s),ae!==4&&(ae=2),io===null?io=[i]:io.push(i),i=l;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var f=Rf(i,a,t);sa(i,f);break e;case 1:s=a;var c=i.type,h=i.stateNode;if(!(i.flags&128)&&(typeof c.getDerivedStateFromError=="function"||h!==null&&typeof h.componentDidCatch=="function"&&(Bt===null||!Bt.has(h)))){i.flags|=65536,t&=-t,i.lanes|=t;var v=Tf(i,s,t);sa(i,v);break e}}i=i.return}while(i!==null)}Vf(r)}catch(L){t=L,le===r&&r!==null&&(le=r=r.return);continue}break}while(!0)}function Of(){var e=zn.current;return zn.current=Pn,e===null?Pn:e}function ms(){(ae===0||ae===3||ae===2)&&(ae=4),fe===null||!(qt&268435455)&&!(Jn&268435455)||yt(fe,de)}function Fn(e,t){var r=H;H|=2;var o=Of();(fe!==e||de!==t)&&(lt=null,Gt(e,t));do try{vd();break}catch(n){Hf(e,n)}while(!0);if(Zl(),H=r,zn.current=o,le!==null)throw Error(k(261));return fe=null,de=0,ae}function vd(){for(;le!==null;)If(le)}function Sd(){for(;le!==null&&!Ac();)If(le)}function If(e){var t=Uf(e.alternate,e,ze);e.memoizedProps=e.pendingProps,t===null?Vf(e):le=t,cs.current=null}function Vf(e){var t=e;do{var r=t.alternate;if(e=t.return,t.flags&32768){if(r=hd(r,t),r!==null){r.flags&=32767,le=r;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{ae=6,le=null;return}}else if(r=cd(r,t,ze),r!==null){le=r;return}if(t=t.sibling,t!==null){le=t;return}le=t=e}while(t!==null);ae===0&&(ae=5)}function Vt(e,t,r){var o=O,n=Oe.transition;try{Oe.transition=null,O=1,yd(e,t,r,o)}finally{Oe.transition=n,O=o}return null}function yd(e,t,r,o){do Rr();while(bt!==null);if(H&6)throw Error(k(327));r=e.finishedWork;var n=e.finishedLanes;if(r===null)return null;if(e.finishedWork=null,e.finishedLanes=0,r===e.current)throw Error(k(177));e.callbackNode=null,e.callbackPriority=0;var i=r.lanes|r.childLanes;if(eh(e,i),e===fe&&(le=fe=null,de=0),!(r.subtreeFlags&2064)&&!(r.flags&2064)||Ko||(Ko=!0,Qf(mn,function(){return Rr(),null})),i=(r.flags&15990)!==0,r.subtreeFlags&15990||i){i=Oe.transition,Oe.transition=null;var l=O;O=1;var s=H;H|=4,cs.current=null,gd(e,r),_f(r,e),Hh(rl),vn=!!tl,rl=tl=null,e.current=r,pd(r),Uc(),H=s,O=l,Oe.transition=i}else e.current=r;if(Ko&&(Ko=!1,bt=e,En=n),i=e.pendingLanes,i===0&&(Bt=null),Gc(r.stateNode),Pe(e,oe()),t!==null)for(o=e.onRecoverableError,r=0;r<t.length;r++)n=t[r],o(n.value,{componentStack:n.stack,digest:n.digest});if(jn)throw jn=!1,e=bl,bl=null,e;return En&1&&e.tag!==0&&Rr(),i=e.pendingLanes,i&1?e===Rl?lo++:(lo=0,Rl=e):lo=0,_t(),null}function Rr(){if(bt!==null){var e=bu(En),t=Oe.transition,r=O;try{if(Oe.transition=null,O=16>e?16:e,bt===null)var o=!1;else{if(e=bt,bt=null,En=0,H&6)throw Error(k(331));var n=H;for(H|=4,B=e.current;B!==null;){var i=B,l=i.child;if(B.flags&16){var s=i.deletions;if(s!==null){for(var a=0;a<s.length;a++){var d=s[a];for(B=d;B!==null;){var m=B;switch(m.tag){case 0:case 11:case 15:no(8,m,i)}var p=m.child;if(p!==null)p.return=m,B=p;else for(;B!==null;){m=B;var g=m.sibling,S=m.return;if(Ef(m),m===d){B=null;break}if(g!==null){g.return=S,B=g;break}B=S}}}var b=i.alternate;if(b!==null){var x=b.child;if(x!==null){b.child=null;do{var P=x.sibling;x.sibling=null,x=P}while(x!==null)}}B=i}}if(i.subtreeFlags&2064&&l!==null)l.return=i,B=l;else e:for(;B!==null;){if(i=B,i.flags&2048)switch(i.tag){case 0:case 11:case 15:no(9,i,i.return)}var f=i.sibling;if(f!==null){f.return=i.return,B=f;break e}B=i.return}}var c=e.current;for(B=c;B!==null;){l=B;var h=l.child;if(l.subtreeFlags&2064&&h!==null)h.return=l,B=h;else e:for(l=c;B!==null;){if(s=B,s.flags&2048)try{switch(s.tag){case 0:case 11:case 15:Gn(9,s)}}catch(L){te(s,s.return,L)}if(s===l){B=null;break e}var v=s.sibling;if(v!==null){v.return=s.return,B=v;break e}B=s.return}}if(H=n,_t(),rt&&typeof rt.onPostCommitFiberRoot=="function")try{rt.onPostCommitFiberRoot(Hn,e)}catch{}o=!0}return o}finally{O=r,Oe.transition=t}}return!1}function $a(e,t,r){t=Br(r,t),t=Rf(e,t,1),e=$t(e,t,1),t=Te(),e!==null&&(Lo(e,1,t),Pe(e,t))}function te(e,t,r){if(e.tag===3)$a(e,e,r);else for(;t!==null;){if(t.tag===3){$a(t,e,r);break}else if(t.tag===1){var o=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(Bt===null||!Bt.has(o))){e=Br(r,e),e=Tf(t,e,1),t=$t(t,e,1),e=Te(),t!==null&&(Lo(t,1,e),Pe(t,e));break}}t=t.return}}function kd(e,t,r){var o=e.pingCache;o!==null&&o.delete(t),t=Te(),e.pingedLanes|=e.suspendedLanes&r,fe===e&&(de&r)===r&&(ae===4||ae===3&&(de&130023424)===de&&500>oe()-ds?Gt(e,0):hs|=r),Pe(e,t)}function Af(e,t){t===0&&(e.mode&1?(t=_o,_o<<=1,!(_o&130023424)&&(_o=4194304)):t=1);var r=Te();e=dt(e,t),e!==null&&(Lo(e,t,r),Pe(e,r))}function bd(e){var t=e.memoizedState,r=0;t!==null&&(r=t.retryLane),Af(e,r)}function Rd(e,t){var r=0;switch(e.tag){case 13:var o=e.stateNode,n=e.memoizedState;n!==null&&(r=n.retryLane);break;case 19:o=e.stateNode;break;default:throw Error(k(314))}o!==null&&o.delete(t),Af(e,r)}var Uf;Uf=function(e,t,r){if(e!==null)if(e.memoizedProps!==t.pendingProps||Be.current)$e=!0;else{if(!(e.lanes&r)&&!(t.flags&128))return $e=!1,fd(e,t,r);$e=!!(e.flags&131072)}else $e=!1,K&&t.flags&1048576&&Gu(t,xn,t.index);switch(t.lanes=0,t.tag){case 2:var o=t.type;an(e,t),e=t.pendingProps;var n=xr(t,Se.current);br(t,r),n=ls(null,t,o,e,n,r);var i=ss();return t.flags|=1,typeof n=="object"&&n!==null&&typeof n.render=="function"&&n.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Ne(o)?(i=!0,Rn(t)):i=!1,t.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,ts(t),n.updater=Kn,t.stateNode=n,n._reactInternals=t,cl(t,o,e,r),t=gl(null,t,o,!0,i,r)):(t.tag=0,K&&i&&Gl(t),Re(null,t,n,r),t=t.child),t;case 16:o=t.elementType;e:{switch(an(e,t),e=t.pendingProps,n=o._init,o=n(o._payload),t.type=o,n=t.tag=xd(o),e=Ue(o,e),n){case 0:t=dl(null,t,o,e,r);break e;case 1:t=va(null,t,o,e,r);break e;case 11:t=ma(null,t,o,e,r);break e;case 14:t=wa(null,t,o,Ue(o.type,e),r);break e}throw Error(k(306,o,""))}return t;case 0:return o=t.type,n=t.pendingProps,n=t.elementType===o?n:Ue(o,n),dl(e,t,o,n,r);case 1:return o=t.type,n=t.pendingProps,n=t.elementType===o?n:Ue(o,n),va(e,t,o,n,r);case 3:e:{if($f(t),e===null)throw Error(k(387));o=t.pendingProps,i=t.memoizedState,n=i.element,ef(e,t),$n(t,o,null,r);var l=t.memoizedState;if(o=l.element,i.isDehydrated)if(i={element:o,isDehydrated:!1,cache:l.cache,pendingSuspenseBoundaries:l.pendingSuspenseBoundaries,transitions:l.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){n=Br(Error(k(423)),t),t=Sa(e,t,o,r,n);break e}else if(o!==n){n=Br(Error(k(424)),t),t=Sa(e,t,o,r,n);break e}else for(je=Ct(t.stateNode.containerInfo.firstChild),Ee=t,K=!0,Ke=null,r=Zu(t,null,o,r),t.child=r;r;)r.flags=r.flags&-3|4096,r=r.sibling;else{if(Lr(),o===n){t=gt(e,t,r);break e}Re(e,t,o,r)}t=t.child}return t;case 5:return tf(t),e===null&&al(t),o=t.type,n=t.pendingProps,i=e!==null?e.memoizedProps:null,l=n.children,ol(o,n)?l=null:i!==null&&ol(o,i)&&(t.flags|=32),Cf(e,t),Re(e,t,l,r),t.child;case 6:return e===null&&al(t),null;case 13:return Bf(e,t,r);case 4:return rs(t,t.stateNode.containerInfo),o=t.pendingProps,e===null?t.child=Cr(t,null,o,r):Re(e,t,o,r),t.child;case 11:return o=t.type,n=t.pendingProps,n=t.elementType===o?n:Ue(o,n),ma(e,t,o,n,r);case 7:return Re(e,t,t.pendingProps,r),t.child;case 8:return Re(e,t,t.pendingProps.children,r),t.child;case 12:return Re(e,t,t.pendingProps.children,r),t.child;case 10:e:{if(o=t.type._context,n=t.pendingProps,i=t.memoizedProps,l=n.value,A(Ln,o._currentValue),o._currentValue=l,i!==null)if(Ye(i.value,l)){if(i.children===n.children&&!Be.current){t=gt(e,t,r);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var s=i.dependencies;if(s!==null){l=i.child;for(var a=s.firstContext;a!==null;){if(a.context===o){if(i.tag===1){a=ft(-1,r&-r),a.tag=2;var d=i.updateQueue;if(d!==null){d=d.shared;var m=d.pending;m===null?a.next=a:(a.next=m.next,m.next=a),d.pending=a}}i.lanes|=r,a=i.alternate,a!==null&&(a.lanes|=r),ul(i.return,r,t),s.lanes|=r;break}a=a.next}}else if(i.tag===10)l=i.type===t.type?null:i.child;else if(i.tag===18){if(l=i.return,l===null)throw Error(k(341));l.lanes|=r,s=l.alternate,s!==null&&(s.lanes|=r),ul(l,r,t),l=i.sibling}else l=i.child;if(l!==null)l.return=i;else for(l=i;l!==null;){if(l===t){l=null;break}if(i=l.sibling,i!==null){i.return=l.return,l=i;break}l=l.return}i=l}Re(e,t,n.children,r),t=t.child}return t;case 9:return n=t.type,o=t.pendingProps.children,br(t,r),n=Ie(n),o=o(n),t.flags|=1,Re(e,t,o,r),t.child;case 14:return o=t.type,n=Ue(o,t.pendingProps),n=Ue(o.type,n),wa(e,t,o,n,r);case 15:return xf(e,t,t.type,t.pendingProps,r);case 17:return o=t.type,n=t.pendingProps,n=t.elementType===o?n:Ue(o,n),an(e,t),t.tag=1,Ne(o)?(e=!0,Rn(t)):e=!1,br(t,r),bf(t,o,n),cl(t,o,n,r),gl(null,t,o,!0,e,r);case 19:return Nf(e,t,r);case 22:return Lf(e,t,r)}throw Error(k(156,t.tag))};function Qf(e,t){return vu(e,t)}function Td(e,t,r,o){this.tag=e,this.key=r,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function He(e,t,r,o){return new Td(e,t,r,o)}function ws(e){return e=e.prototype,!(!e||!e.isReactComponent)}function xd(e){if(typeof e=="function")return ws(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Dl)return 11;if(e===_l)return 14}return 2}function Pt(e,t){var r=e.alternate;return r===null?(r=He(e.tag,t,e.key,e.mode),r.elementType=e.elementType,r.type=e.type,r.stateNode=e.stateNode,r.alternate=e,e.alternate=r):(r.pendingProps=t,r.type=e.type,r.flags=0,r.subtreeFlags=0,r.deletions=null),r.flags=e.flags&14680064,r.childLanes=e.childLanes,r.lanes=e.lanes,r.child=e.child,r.memoizedProps=e.memoizedProps,r.memoizedState=e.memoizedState,r.updateQueue=e.updateQueue,t=e.dependencies,r.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},r.sibling=e.sibling,r.index=e.index,r.ref=e.ref,r}function cn(e,t,r,o,n,i){var l=2;if(o=e,typeof e=="function")ws(e)&&(l=1);else if(typeof e=="string")l=5;else e:switch(e){case sr:return Jt(r.children,n,i,t);case Fl:l=8,n|=8;break;case Fi:return e=He(12,r,t,n|2),e.elementType=Fi,e.lanes=i,e;case Di:return e=He(13,r,t,n),e.elementType=Di,e.lanes=i,e;case _i:return e=He(19,r,t,n),e.elementType=_i,e.lanes=i,e;case tu:return Yn(r,n,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case qa:l=10;break e;case eu:l=9;break e;case Dl:l=11;break e;case _l:l=14;break e;case wt:l=16,o=null;break e}throw Error(k(130,e==null?e:typeof e,""))}return t=He(l,r,t,n),t.elementType=e,t.type=o,t.lanes=i,t}function Jt(e,t,r,o){return e=He(7,e,o,t),e.lanes=r,e}function Yn(e,t,r,o){return e=He(22,e,o,t),e.elementType=tu,e.lanes=r,e.stateNode={isHidden:!1},e}function $i(e,t,r){return e=He(6,e,null,t),e.lanes=r,e}function Bi(e,t,r){return t=He(4,e.children!==null?e.children:[],e.key,t),t.lanes=r,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Ld(e,t,r,o,n){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ui(0),this.expirationTimes=ui(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ui(0),this.identifierPrefix=o,this.onRecoverableError=n,this.mutableSourceEagerHydrationData=null}function vs(e,t,r,o,n,i,l,s,a){return e=new Ld(e,t,r,s,a),t===1?(t=1,i===!0&&(t|=8)):t=0,i=He(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:o,isDehydrated:r,cache:null,transitions:null,pendingSuspenseBoundaries:null},ts(i),e}function Cd(e,t,r){var o=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:lr,key:o==null?null:""+o,children:e,containerInfo:t,implementation:r}}function Kf(e){if(!e)return jt;e=e._reactInternals;e:{if(rr(e)!==e||e.tag!==1)throw Error(k(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Ne(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(k(171))}if(e.tag===1){var r=e.type;if(Ne(r))return Qu(e,r,t)}return t}function Gf(e,t,r,o,n,i,l,s,a){return e=vs(r,o,!0,e,n,i,l,s,a),e.context=Kf(null),r=e.current,o=Te(),n=Nt(r),i=ft(o,n),i.callback=t??null,$t(r,i,n),e.current.lanes=n,Lo(e,n,o),Pe(e,o),e}function Xn(e,t,r,o){var n=t.current,i=Te(),l=Nt(n);return r=Kf(r),t.context===null?t.context=r:t.pendingContext=r,t=ft(i,l),t.payload={element:e},o=o===void 0?null:o,o!==null&&(t.callback=o),e=$t(n,t,l),e!==null&&(Je(e,n,l,i),nn(e,n,l)),l}function Dn(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Ba(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var r=e.retryLane;e.retryLane=r!==0&&r<t?r:t}}function Ss(e,t){Ba(e,t),(e=e.alternate)&&Ba(e,t)}function $d(){return null}var Jf=typeof reportError=="function"?reportError:function(e){console.error(e)};function ys(e){this._internalRoot=e}Zn.prototype.render=ys.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(k(409));Xn(e,t,null,null)};Zn.prototype.unmount=ys.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;er(function(){Xn(null,e,null,null)}),t[ht]=null}};function Zn(e){this._internalRoot=e}Zn.prototype.unstable_scheduleHydration=function(e){if(e){var t=xu();e={blockedOn:null,target:e,priority:t};for(var r=0;r<St.length&&t!==0&&t<St[r].priority;r++);St.splice(r,0,e),r===0&&Cu(e)}};function ks(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function qn(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Na(){}function Bd(e,t,r,o,n){if(n){if(typeof o=="function"){var i=o;o=function(){var d=Dn(l);i.call(d)}}var l=Gf(t,o,e,0,null,!1,!1,"",Na);return e._reactRootContainer=l,e[ht]=l.current,mo(e.nodeType===8?e.parentNode:e),er(),l}for(;n=e.lastChild;)e.removeChild(n);if(typeof o=="function"){var s=o;o=function(){var d=Dn(a);s.call(d)}}var a=vs(e,0,!1,null,null,!1,!1,"",Na);return e._reactRootContainer=a,e[ht]=a.current,mo(e.nodeType===8?e.parentNode:e),er(function(){Xn(t,a,r,o)}),a}function ei(e,t,r,o,n){var i=r._reactRootContainer;if(i){var l=i;if(typeof n=="function"){var s=n;n=function(){var a=Dn(l);s.call(a)}}Xn(t,l,e,n)}else l=Bd(r,t,e,n,o);return Dn(l)}Ru=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var r=Yr(t.pendingLanes);r!==0&&(Hl(t,r|1),Pe(t,oe()),!(H&6)&&(Nr=oe()+500,_t()))}break;case 13:er(function(){var o=dt(e,1);if(o!==null){var n=Te();Je(o,e,1,n)}}),Ss(e,1)}};Ol=function(e){if(e.tag===13){var t=dt(e,134217728);if(t!==null){var r=Te();Je(t,e,134217728,r)}Ss(e,134217728)}};Tu=function(e){if(e.tag===13){var t=Nt(e),r=dt(e,t);if(r!==null){var o=Te();Je(r,e,t,o)}Ss(e,t)}};xu=function(){return O};Lu=function(e,t){var r=O;try{return O=e,t()}finally{O=r}};Ki=function(e,t,r){switch(t){case"input":if(Hi(e,r),t=r.name,r.type==="radio"&&t!=null){for(r=e;r.parentNode;)r=r.parentNode;for(r=r.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<r.length;t++){var o=r[t];if(o!==e&&o.form===e.form){var n=An(o);if(!n)throw Error(k(90));ou(o),Hi(o,n)}}}break;case"textarea":iu(e,r);break;case"select":t=r.value,t!=null&&vr(e,!!r.multiple,t,!1)}};hu=gs;du=er;var Nd={usingClientEntryPoint:!1,Events:[$o,cr,An,fu,cu,gs]},Kr={findFiberByHostInstance:Ut,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Pd={bundleType:Kr.bundleType,version:Kr.version,rendererPackageName:Kr.rendererPackageName,rendererConfig:Kr.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:pt.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=mu(e),e===null?null:e.stateNode},findFiberByHostInstance:Kr.findFiberByHostInstance||$d,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Go=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Go.isDisabled&&Go.supportsFiber)try{Hn=Go.inject(Pd),rt=Go}catch{}}De.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Nd;De.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!ks(t))throw Error(k(200));return Cd(e,t,null,r)};De.createRoot=function(e,t){if(!ks(e))throw Error(k(299));var r=!1,o="",n=Jf;return t!=null&&(t.unstable_strictMode===!0&&(r=!0),t.identifierPrefix!==void 0&&(o=t.identifierPrefix),t.onRecoverableError!==void 0&&(n=t.onRecoverableError)),t=vs(e,1,!1,null,null,r,!1,o,n),e[ht]=t.current,mo(e.nodeType===8?e.parentNode:e),new ys(t)};De.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(k(188)):(e=Object.keys(e).join(","),Error(k(268,e)));return e=mu(t),e=e===null?null:e.stateNode,e};De.flushSync=function(e){return er(e)};De.hydrate=function(e,t,r){if(!qn(t))throw Error(k(200));return ei(null,e,t,!0,r)};De.hydrateRoot=function(e,t,r){if(!ks(e))throw Error(k(405));var o=r!=null&&r.hydratedSources||null,n=!1,i="",l=Jf;if(r!=null&&(r.unstable_strictMode===!0&&(n=!0),r.identifierPrefix!==void 0&&(i=r.identifierPrefix),r.onRecoverableError!==void 0&&(l=r.onRecoverableError)),t=Gf(t,null,e,1,r??null,n,!1,i,l),e[ht]=t.current,mo(e),o)for(e=0;e<o.length;e++)r=o[e],n=r._getVersion,n=n(r._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[r,n]:t.mutableSourceEagerHydrationData.push(r,n);return new Zn(t)};De.render=function(e,t,r){if(!qn(t))throw Error(k(200));return ei(null,e,t,!1,r)};De.unmountComponentAtNode=function(e){if(!qn(e))throw Error(k(40));return e._reactRootContainer?(er(function(){ei(null,null,e,!1,function(){e._reactRootContainer=null,e[ht]=null})}),!0):!1};De.unstable_batchedUpdates=gs;De.unstable_renderSubtreeIntoContainer=function(e,t,r,o){if(!qn(r))throw Error(k(200));if(e==null||e._reactInternals===void 0)throw Error(k(38));return ei(e,t,r,!1,o)};De.version="18.3.1-next-f1338f8080-20240426";function Yf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Yf)}catch(e){console.error(e)}}Yf(),Ja.exports=De;var zd=Ja.exports,Pa=zd;ji.createRoot=Pa.createRoot,ji.hydrateRoot=Pa.hydrateRoot;/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jd=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Xf=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Ed={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fd=W.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:n="",children:i,iconNode:l,...s},a)=>W.createElement("svg",{ref:a,...Ed,width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:Xf("lucide",n),...s},[...l.map(([d,m])=>W.createElement(d,m)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=(e,t)=>{const r=W.forwardRef(({className:o,...n},i)=>W.createElement(Fd,{ref:i,iconNode:t,className:Xf(`lucide-${jd(e)}`,o),...n}));return r.displayName=`${e}`,r};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dd=pe("Bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const za=pe("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ni=pe("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _d=pe("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ll=pe("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zf=pe("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Md=pe("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wd=pe("Music",[["path",{d:"M9 18V5l12-2v13",key:"1jmyc2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["circle",{cx:"18",cy:"16",r:"3",key:"1hluhg"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hd=pe("Pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=pe("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ja=pe("RefreshCcw",[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Od=pe("Scissors",[["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M8.12 8.12 12 12",key:"1alkpv"}],["path",{d:"M20 4 8.12 15.88",key:"xgtan2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["path",{d:"M14.8 14.8 20 20",key:"ptml3r"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Id=pe("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vd=pe("StickyNote",[["path",{d:"M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z",key:"qazsjp"}],["path",{d:"M15 3v4a2 2 0 0 0 2 2h4",key:"40519r"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ad=pe("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ir=pe("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ud=pe("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),Rt=["No turn","1/8","1/4","3/8","1/2","5/8","3/4","7/8","full"],Ea="linedance_builder_data_v13",_n="Anthonytau4@gmail.com",Qd=["","NZ","AU","UK","US","CA","IE"],Kd=350,Gd={lightMode:"./light-mode.mp3",darkMode:"./dark-mode.mp3",tabChange:"./tab-change.wav",action:"./ui-action.mp3",menuOpen:"./open-right-click.mp3",delete:"./delete.mp3"},ie=()=>Math.random().toString(36).substr(2,9),Jo=(e="",t="1",r="8-count")=>{const o=r==="waltz"?6:8,n=String(e||""),i=String(t||"1"),l=n.match(/\d+/g);let s=0;l&&l.length>0&&(s=parseInt(l[l.length-1],10));let a=s+1;a>o&&(a=1);const d=i.match(/\d+/g);if(!d||d.length===0)return i;const m=parseInt(d[0],10),p=a-m;return i.replace(/\d+/g,g=>{let S=parseInt(g,10)+p;for(;S>o;)S-=o;for(;S<1;)S+=o;return S.toString()})},qf=(e,t,r,o)=>{if(!t)return"";if(!o)return t;if(e&&e.toLowerCase().includes("diamond")){if(o==="No turn"){const m=r==="L"?"left":"right",p=r==="L"?"right":"left";return`Cross ${m} over ${p}, step ${p} to side, step ${m} back. Cross ${p} behind ${m}, step ${m} to side, step ${p} forward. (Straighten up to wall)`}const n=r==="L",i=n?"left":"right",l=n?"right":"left",s=n?"left":"right";let a=1;o==="1/8"?a=.5:o==="1/4"?a=1:o==="3/8"?a=1.5:o==="1/2"?a=2:o==="5/8"?a=2.5:o==="3/4"?a=3:o==="7/8"?a=3.5:o==="full"&&(a=4);let d=[];for(let m=0;m<Math.floor(a);m++)d.push(`Cross ${i} over ${l}, step ${l} back turning 1/8 ${s}, step ${i} back.`),d.push(`Cross ${l} behind ${i}, step ${i} forward turning 1/8 ${s}, step ${l} forward.`);return a%1!==0&&d.push(`Cross ${i} over ${l}, step ${l} back turning 1/8 ${s}, step ${i} back.`),d.push("(Straighten up to wall)"),d.join(" ")}return o==="No turn"?t.replace(/\bturn(ing)?\b/ig,"").replace(/\s+/g," ").trim():/\bturn\b/i.test(t)?t.replace(/\bturn\b/i,`${o} turn`):t+` making a ${o} turn`},Jd=[{name:"Step Forward Left",desc:"Step the left foot forward, transferring weight entirely.",foot:"L",counts:"1",weight:!0},{name:"Step Forward Right",desc:"Step the right foot forward, transferring weight entirely.",foot:"R",counts:"1",weight:!0},{name:"Step Back Left",desc:"Step the left foot backward, transferring weight entirely.",foot:"L",counts:"1",weight:!0},{name:"Step Back Right",desc:"Step the right foot backward, transferring weight entirely.",foot:"R",counts:"1",weight:!0},{name:"Step Side Left",desc:"Step the left foot straight out to the left side.",foot:"L",counts:"1",weight:!0},{name:"Step Side Right",desc:"Step the right foot straight out to the right side.",foot:"R",counts:"1",weight:!0},{name:"Step In Place Left",desc:"Step the left foot down exactly where it is currently positioned.",foot:"L",counts:"1",weight:!0},{name:"Step In Place Right",desc:"Step the right foot down exactly where it is currently positioned.",foot:"R",counts:"1",weight:!0},{name:"Walk Forward Left",desc:"Walk smoothly forward on the left foot.",foot:"L",counts:"1",weight:!0},{name:"Walk Forward Right",desc:"Walk smoothly forward on the right foot.",foot:"R",counts:"1",weight:!0},{name:"Walk Back Left",desc:"Walk smoothly backward on the left foot.",foot:"L",counts:"1",weight:!0},{name:"Walk Back Right",desc:"Walk smoothly backward on the right foot.",foot:"R",counts:"1",weight:!0},{name:"Cross Left",desc:"Cross the left foot entirely over and in front of the right foot.",foot:"L",counts:"1",weight:!0},{name:"Cross Right",desc:"Cross the right foot entirely over and in front of the left foot.",foot:"R",counts:"1",weight:!0},{name:"Behind Left",desc:"Cross the left foot entirely behind the right foot.",foot:"L",counts:"1",weight:!0},{name:"Behind Right",desc:"Cross the right foot entirely behind the left foot.",foot:"R",counts:"1",weight:!0},{name:"Together Left",desc:"Pull the left foot tightly beside the right foot, transferring weight.",foot:"L",counts:"1",weight:!0},{name:"Together Right",desc:"Pull the right foot tightly beside the left foot, transferring weight.",foot:"R",counts:"1",weight:!0},{name:"Ball Left",desc:"Step quickly onto the ball of the left foot.",foot:"L",counts:"&",weight:!0},{name:"Ball Right",desc:"Step quickly onto the ball of the right foot.",foot:"R",counts:"&",weight:!0},{name:"Touch Beside Left",desc:"Lightly touch the left toe beside the right foot without transferring weight.",foot:"L",counts:"1",weight:!1},{name:"Touch Beside Right",desc:"Lightly touch the right toe beside the left foot without transferring weight.",foot:"R",counts:"1",weight:!1},{name:"Touch Forward Left",desc:"Lightly touch the left toe forward without transferring weight.",foot:"L",counts:"1",weight:!1},{name:"Touch Forward Right",desc:"Lightly touch the right toe forward without transferring weight.",foot:"R",counts:"1",weight:!1},{name:"Touch Side Left",desc:"Lightly touch the left toe out to the left side without transferring weight.",foot:"L",counts:"1",weight:!1},{name:"Touch Side Right",desc:"Lightly touch the right toe out to the right side without transferring weight.",foot:"R",counts:"1",weight:!1},{name:"Touch Back Left",desc:"Lightly touch the left toe directly behind the right foot.",foot:"L",counts:"1",weight:!1},{name:"Touch Back Right",desc:"Lightly touch the right toe directly behind the left foot.",foot:"R",counts:"1",weight:!1},{name:"Tap Beside Left",desc:"Give a sharp, light tap of the left toe beside the right foot.",foot:"L",counts:"1",weight:!1},{name:"Tap Beside Right",desc:"Give a sharp, light tap of the right toe beside the left foot.",foot:"R",counts:"1",weight:!1},{name:"Tap Forward Left",desc:"Give a sharp tap of the left toe forward.",foot:"L",counts:"1",weight:!1},{name:"Tap Forward Right",desc:"Give a sharp tap of the right toe forward.",foot:"R",counts:"1",weight:!1},{name:"Tap Side Left",desc:"Give a sharp tap of the left toe to the left side.",foot:"L",counts:"1",weight:!1},{name:"Tap Side Right",desc:"Give a sharp tap of the right toe to the right side.",foot:"R",counts:"1",weight:!1},{name:"Point Side Left",desc:"Extend the leg and point the left toe firmly out to the left side.",foot:"L",counts:"1",weight:!1},{name:"Point Side Right",desc:"Extend the leg and point the right toe firmly out to the right side.",foot:"R",counts:"1",weight:!1},{name:"Point Forward Left",desc:"Extend the leg and point the left toe firmly forward.",foot:"L",counts:"1",weight:!1},{name:"Point Forward Right",desc:"Extend the leg and point the right toe firmly forward.",foot:"R",counts:"1",weight:!1},{name:"Point Back Left",desc:"Extend the leg and point the left toe firmly backward.",foot:"L",counts:"1",weight:!1},{name:"Point Back Right",desc:"Extend the leg and point the right toe firmly backward.",foot:"R",counts:"1",weight:!1},{name:"Point Cross Left",desc:"Point the left toe firmly across the front of the right foot.",foot:"L",counts:"1",weight:!1},{name:"Point Cross Right",desc:"Point the right toe firmly across the front of the left foot.",foot:"R",counts:"1",weight:!1},{name:"Heel Left",desc:"Dig the left heel forward, resting it lightly on the floor.",foot:"L",counts:"1",weight:!1},{name:"Heel Right",desc:"Dig the right heel forward, resting it lightly on the floor.",foot:"R",counts:"1",weight:!1},{name:"Heel Dig Left",desc:"Thrust the left heel into the floor diagonally forward.",foot:"L",counts:"1",weight:!1},{name:"Heel Dig Right",desc:"Thrust the right heel into the floor diagonally forward.",foot:"R",counts:"1",weight:!1},{name:"Toe Back Left",desc:"Touch the left toe firmly behind the right foot.",foot:"L",counts:"1",weight:!1},{name:"Toe Back Right",desc:"Touch the right toe firmly behind the left foot.",foot:"R",counts:"1",weight:!1},{name:"Toe Tap Left",desc:"Tap the left toe sharply on the floor.",foot:"L",counts:"1",weight:!1},{name:"Toe Tap Right",desc:"Tap the right toe sharply on the floor.",foot:"R",counts:"1",weight:!1},{name:"Heel Bounce",desc:"With weight evenly distributed on the balls of both feet, quickly lift and drop both heels.",foot:"Both",counts:"1",weight:!1},{name:"Heel Splits",desc:"Keeping the balls of the feet together, spread both heels apart widely, then pull them back to center.",foot:"Both",counts:"1-2",weight:!1},{name:"Toe Splits",desc:"With heels planted firmly, rigidly fan both toes outward, then pull them back together.",foot:"Both",counts:"1-2",weight:!1},{name:"Kick Forward Left",desc:"Execute a clean, straight forward leg kick using the left foot.",foot:"L",counts:"1",weight:!1},{name:"Kick Forward Right",desc:"Execute a clean, straight forward leg kick using the right foot.",foot:"R",counts:"1",weight:!1},{name:"Kick Diagonal Left",desc:"Kick the left foot forcefully out toward the front-left diagonal.",foot:"L",counts:"1",weight:!1},{name:"Kick Diagonal Right",desc:"Kick the right foot forcefully out toward the front-right diagonal.",foot:"R",counts:"1",weight:!1},{name:"Cross Kick Left",desc:"Kick the left foot forcefully across the front of the right leg.",foot:"L",counts:"1",weight:!1},{name:"Cross Kick Right",desc:"Kick the right foot forcefully across the front of the left leg.",foot:"R",counts:"1",weight:!1},{name:"Scuff Forward Left",desc:"Swing the left leg forward, intentionally scuffing the heel against the floor.",foot:"L",counts:"1",weight:!1},{name:"Scuff Forward Right",desc:"Swing the right leg forward, intentionally scuffing the heel against the floor.",foot:"R",counts:"1",weight:!1},{name:"Scuff Cross Left",desc:"Swing the left leg forward, scuffing the heel while crossing over the right leg.",foot:"L",counts:"1",weight:!1},{name:"Scuff Cross Right",desc:"Swing the right leg forward, scuffing the heel while crossing over the left leg.",foot:"R",counts:"1",weight:!1},{name:"Brush Forward Left",desc:"Sweep the ball of the left foot forward, lightly grazing the floor.",foot:"L",counts:"1",weight:!1},{name:"Brush Forward Right",desc:"Sweep the ball of the right foot forward, lightly grazing the floor.",foot:"R",counts:"1",weight:!1},{name:"Brush Back Left",desc:"Sweep the ball of the left foot backward, lightly grazing the floor.",foot:"L",counts:"1",weight:!1},{name:"Brush Back Right",desc:"Sweep the ball of the right foot backward, lightly grazing the floor.",foot:"R",counts:"1",weight:!1},{name:"Brush Cross Left",desc:"Brush the left foot across the right leg.",foot:"L",counts:"1",weight:!1},{name:"Brush Cross Right",desc:"Brush the right foot across the left leg.",foot:"R",counts:"1",weight:!1},{name:"Sweep Forward Left",desc:"Sweep the left foot in a smooth circular arc from back to front.",foot:"L",counts:"1",weight:!1},{name:"Sweep Forward Right",desc:"Sweep the right foot in a smooth circular arc from back to front.",foot:"R",counts:"1",weight:!1},{name:"Sweep Back Left",desc:"Sweep the left foot in a smooth circular arc from front to back.",foot:"L",counts:"1",weight:!1},{name:"Sweep Back Right",desc:"Sweep the right foot in a smooth circular arc from front to back.",foot:"R",counts:"1",weight:!1},{name:"Slide Forward Left",desc:"Maintain floor contact and smoothly slide the left foot forward.",foot:"L",counts:"1",weight:!0},{name:"Slide Forward Right",desc:"Maintain floor contact and smoothly slide the right foot forward.",foot:"R",counts:"1",weight:!0},{name:"Slide Back Left",desc:"Maintain floor contact and smoothly slide the left foot backward.",foot:"L",counts:"1",weight:!0},{name:"Slide Back Right",desc:"Maintain floor contact and smoothly slide the right foot backward.",foot:"R",counts:"1",weight:!0},{name:"Slide Side Left",desc:"Maintain floor contact and smoothly slide the left foot to the left side.",foot:"L",counts:"1",weight:!0},{name:"Slide Side Right",desc:"Maintain floor contact and smoothly slide the right foot to the right side.",foot:"R",counts:"1",weight:!0},{name:"Drag Left",desc:"Keep the left foot in contact with the floor and slowly draw it toward the supporting right foot.",foot:"L",counts:"1-2",weight:!1},{name:"Drag Right",desc:"Keep the right foot in contact with the floor and slowly draw it toward the supporting left foot.",foot:"R",counts:"1-2",weight:!1},{name:"Hitch Left",desc:"Sharply raise the left knee upward, bringing the thigh parallel to the floor.",foot:"L",counts:"1",weight:!1},{name:"Hitch Right",desc:"Sharply raise the right knee upward, bringing the thigh parallel to the floor.",foot:"R",counts:"1",weight:!1},{name:"Hitch Turn Left",desc:"Hitch the left knee upward while simultaneously hopping and executing a turn left.",needsTurn:!0,foot:"L",counts:"1",weight:!1},{name:"Hitch Turn Right",desc:"Hitch the right knee upward while simultaneously hopping and executing a turn right.",needsTurn:!0,foot:"R",counts:"1",weight:!1},{name:"Hook Left",desc:"Lift the left foot and hook it cleanly across the front of the right shin.",foot:"L",counts:"1",weight:!1},{name:"Hook Right",desc:"Lift the right foot and hook it cleanly across the front of the left shin.",foot:"R",counts:"1",weight:!1},{name:"Hook Behind Left",desc:"Lift the left foot and hook it cleanly behind the right calf.",foot:"L",counts:"1",weight:!1},{name:"Hook Behind Right",desc:"Lift the right foot and hook it cleanly behind the left calf.",foot:"R",counts:"1",weight:!1},{name:"Stomp Left",desc:"Slam the left foot heavily onto the floor, transferring weight entirely.",foot:"L",counts:"1",weight:!0},{name:"Stomp Right",desc:"Slam the right foot heavily onto the floor, transferring weight entirely.",foot:"R",counts:"1",weight:!0},{name:"Stomp Beside Left",desc:"Slam the left foot heavily onto the floor beside the right, transferring weight.",foot:"L",counts:"1",weight:!0},{name:"Stomp Beside Right",desc:"Slam the right foot heavily onto the floor beside the left, transferring weight.",foot:"R",counts:"1",weight:!0},{name:"Stomp Up Left",desc:"Slam the left foot onto the floor for audible impact, instantly lifting it to retain weight on the right.",foot:"L",counts:"1",weight:!1},{name:"Stomp Up Right",desc:"Slam the right foot onto the floor for audible impact, instantly lifting it to retain weight on the left.",foot:"R",counts:"1",weight:!1},{name:"Stamp Left",desc:"Strike the flat of the left foot into the floor and rebound it upward, no weight.",foot:"L",counts:"1",weight:!1},{name:"Stamp Right",desc:"Strike the flat of the right foot into the floor and rebound it upward, no weight.",foot:"R",counts:"1",weight:!1},{name:"Rock Forward Left",desc:"Rock forward onto the left foot, recover back onto the right foot.",foot:"L",counts:"1-2",weight:!0},{name:"Rock Forward Right",desc:"Rock forward onto the right foot, recover back onto the left foot.",foot:"R",counts:"1-2",weight:!0},{name:"Rock Back Left",desc:"Rock back onto the left foot, recover forward onto the right foot.",foot:"L",counts:"1-2",weight:!0},{name:"Rock Back Right",desc:"Rock back onto the right foot, recover forward onto the left foot.",foot:"R",counts:"1-2",weight:!0},{name:"Rock Side Left",desc:"Rock to the left side onto the left foot, recover onto the right foot.",foot:"L",counts:"1-2",weight:!0},{name:"Rock Side Right",desc:"Rock to the right side onto the right foot, recover onto the left foot.",foot:"R",counts:"1-2",weight:!0},{name:"Cross Rock Left",desc:"Rock the left foot across and over the right foot, recover back onto the right foot.",foot:"L",counts:"1-2",weight:!0},{name:"Cross Rock Right",desc:"Rock the right foot across and over the left foot, recover back onto the left foot.",foot:"R",counts:"1-2",weight:!0},{name:"Recover Left",desc:"Recover weight onto the left foot.",foot:"L",counts:"2",weight:!0},{name:"Recover Right",desc:"Recover weight onto the right foot.",foot:"R",counts:"2",weight:!0},{name:"Pony Step Back Right",desc:"Step the right foot back while lifting the left knee, step the left foot beside the right, step the right foot back while lifting the left knee again.",foot:"R",counts:"1&2",weight:!0},{name:"Pony Step Back Left",desc:"Step the left foot back while lifting the right knee, step the right foot beside the left, step the left foot back while lifting the right knee again.",foot:"L",counts:"1&2",weight:!0},{name:"Pony Back Right",desc:"Step the right foot back while lifting the left knee, step the left foot beside the right, step the right foot back while lifting the left knee again.",foot:"R",counts:"1&2",weight:!0},{name:"Pony Back Left",desc:"Step the left foot back while lifting the right knee, step the right foot beside the left, step the left foot back while lifting the right knee again.",foot:"L",counts:"1&2",weight:!0},{name:"Pony Step Right",desc:"Step the right foot back while lifting the left knee, step the left foot beside the right, step the right foot back while lifting the left knee again.",foot:"R",counts:"1&2",weight:!0},{name:"Pony Step Left",desc:"Step the left foot back while lifting the right knee, step the right foot beside the left, step the left foot back while lifting the right knee again.",foot:"L",counts:"1&2",weight:!0},{name:"Pony Right",desc:"Step the right foot back while lifting the left knee, step the left foot beside the right, step the right foot back while lifting the left knee again.",foot:"R",counts:"1&2",weight:!0},{name:"Pony Left",desc:"Step the left foot back while lifting the right knee, step the right foot beside the left, step the left foot back while lifting the right knee again.",foot:"L",counts:"1&2",weight:!0},{name:"Side Pony Right",desc:"Step the right foot to the right side, recover back onto the left foot, step the right foot beside the left.",foot:"R",counts:"1-2&",weight:!0},{name:"Side Pony Left",desc:"Step the left foot to the left side, recover back onto the right foot, step the left foot beside the right.",foot:"L",counts:"1-2&",weight:!0},{name:"Pony Side Right",desc:"Step the right foot to the right side, recover back onto the left foot, step the right foot beside the left.",foot:"R",counts:"1-2&",weight:!0},{name:"Pony Side Left",desc:"Step the left foot to the left side, recover back onto the right foot, step the left foot beside the right.",foot:"L",counts:"1-2&",weight:!0},{name:"Pony Forward Right",desc:"Step the right foot forward while lifting the left knee, step the left foot beside the right, step the right foot forward while lifting the left knee again.",foot:"R",counts:"1&2",weight:!0},{name:"Pony Forward Left",desc:"Step the left foot forward while lifting the right knee, step the right foot beside the left, step the left foot forward while lifting the right knee again.",foot:"L",counts:"1&2",weight:!0},{name:"Pony Rock Right",desc:"Rock the right foot back while lifting the left knee, recover onto the left foot, step the right foot back while lifting the left knee again.",foot:"R",counts:"1&2",weight:!0},{name:"Pony Rock Left",desc:"Rock the left foot back while lifting the right knee, recover onto the right foot, step the left foot back while lifting the right knee again.",foot:"L",counts:"1&2",weight:!0},{name:"Sway Left",desc:"Fluidly lean and push the entire upper torso outward to the left, taking weight left.",foot:"L",counts:"1",weight:!0},{name:"Sway Right",desc:"Fluidly lean and push the entire upper torso outward to the right, taking weight right.",foot:"R",counts:"1",weight:!0},{name:"Hip Bump Left",desc:"Push the left hip out to the left side.",foot:"L",counts:"1",weight:!1},{name:"Hip Bump Right",desc:"Push the right hip out to the right side.",foot:"R",counts:"1",weight:!1},{name:"Coaster Step Forward Left",desc:"Step forward on the left foot, step the right foot beside the left, step backward on the left foot.",foot:"L",counts:"1&2"},{name:"Coaster Step Forward Right",desc:"Step forward on the right foot, step the left foot beside the right, step backward on the right foot.",foot:"R",counts:"1&2"},{name:"Coaster Step Back Left",desc:"Step backward on the left foot, step the right foot beside the left, step forward on the left foot.",foot:"L",counts:"1&2"},{name:"Coaster Step Back Right",desc:"Step backward on the right foot, step the left foot beside the right, step forward on the right foot.",foot:"R",counts:"1&2"},{name:"Coaster Cross Left",desc:"Step backward on the left foot, step the right foot beside the left, cross the left foot tightly over the right.",foot:"L",counts:"1&2"},{name:"Coaster Cross Right",desc:"Step backward on the right foot, step the left foot beside the right, cross the right foot tightly over the left.",foot:"R",counts:"1&2"},{name:"Sailor Step Left",desc:"Cross the left foot behind the right, step the right foot to the right side, step the left foot in place.",foot:"L",counts:"1&2"},{name:"Sailor Step Right",desc:"Cross the right foot behind the left, step the left foot to the left side, step the right foot in place.",foot:"R",counts:"1&2"},{name:"Sailor Cross Left",desc:"Cross the left foot behind the right, step the right foot to the side, cross the left foot over the right.",foot:"L",counts:"1&2"},{name:"Sailor Cross Right",desc:"Cross the right foot behind the left, step the left foot to the side, cross the right foot over the left.",foot:"R",counts:"1&2"},{name:"Sailor Turn Left",desc:"Cross the left foot behind the right executing a turn left, step the right foot side, step the left foot in place.",needsTurn:!0,foot:"L",counts:"1&2"},{name:"Sailor Turn Right",desc:"Cross the right foot behind the left executing a turn right, step the left foot side, step the right foot in place.",needsTurn:!0,foot:"R",counts:"1&2"},{name:"Mambo Forward Left",desc:"Rock forward onto the left foot, recover weight back to the right, step the left foot beside the right.",foot:"L",counts:"1&2"},{name:"Mambo Forward Right",desc:"Rock forward onto the right foot, recover weight back to the left, step the right foot beside the left.",foot:"R",counts:"1&2"},{name:"Mambo Back Left",desc:"Rock backward onto the left foot, recover weight forward to the right, step the left foot beside the right.",foot:"L",counts:"1&2"},{name:"Mambo Back Right",desc:"Rock backward onto the right foot, recover weight forward to the left, step the right foot beside the left.",foot:"R",counts:"1&2"},{name:"Mambo Side Left",desc:"Rock the left foot out to the left side, recover weight to the right, step the left foot beside the right.",foot:"L",counts:"1&2"},{name:"Mambo Side Right",desc:"Rock the right foot out to the right side, recover weight to the left, step the right foot beside the left.",foot:"R",counts:"1&2"},{name:"Mambo Cross Left",desc:"Rock the left foot to the left side, recover weight to the right, cross the left foot entirely over the right.",foot:"L",counts:"1&2"},{name:"Mambo Cross Right",desc:"Rock the right foot to the right side, recover weight to the left, cross the right foot entirely over the left.",foot:"R",counts:"1&2"},{name:"Shuffle Forward Left",desc:"Step the left foot forward, step the right foot next to left, step the left foot forward.",foot:"L",counts:"1&2"},{name:"Shuffle Forward Right",desc:"Step the right foot forward, step the left foot next to right, step the right foot forward.",foot:"R",counts:"1&2"},{name:"Shuffle Back Left",desc:"Step the left foot backward, step the right foot next to left, step the left foot backward.",foot:"L",counts:"1&2"},{name:"Shuffle Back Right",desc:"Step the right foot backward, step the left foot next to right, step the right foot backward.",foot:"R",counts:"1&2"},{name:"Shuffle Turn Left",desc:"Execute a continuous turning shuffle sequence to the left, stepping Left-Right-Left.",needsTurn:!0,foot:"L",counts:"1&2"},{name:"Shuffle Turn Right",desc:"Execute a continuous turning shuffle sequence to the right, stepping Right-Left-Right.",needsTurn:!0,foot:"R",counts:"1&2"},{name:"Chasse Left",desc:"Step the left foot to the left side, close the right foot next to left, step the left foot to the left side.",foot:"L",counts:"1&2"},{name:"Chasse Right",desc:"Step the right foot to the right side, close the left foot next to right, step the right foot to the right side.",foot:"R",counts:"1&2"},{name:"Step Lock Step Forward Left",desc:"Step the left foot forward, tightly lock the right foot behind the left, step the left foot forward.",foot:"L",counts:"1&2"},{name:"Step Lock Step Forward Right",desc:"Step the right foot forward, tightly lock the left foot behind the right, step the right foot forward.",foot:"R",counts:"1&2"},{name:"Step Lock Step Back Left",desc:"Step the left foot backward, tightly lock the right foot across the front of the left, step the left foot backward.",foot:"L",counts:"1&2"},{name:"Step Lock Step Back Right",desc:"Step the right foot backward, tightly lock the left foot across the front of the right, step the right foot backward.",foot:"R",counts:"1&2"},{name:"Grapevine Left",desc:"Step the left foot to the left side, cross the right foot behind the left, step the left foot to the left side.",foot:"L",counts:"1-2-3"},{name:"Grapevine Right",desc:"Step the right foot to the right side, cross the left foot behind the right, step the right foot to the right side.",foot:"R",counts:"1-2-3"},{name:"Rolling Vine Left",desc:"Step left 1/4 turn, spin 1/2 turn left stepping right back, spin 1/4 turn left stepping left to side.",needsTurn:!0,foot:"L",counts:"1-2-3"},{name:"Rolling Vine Right",desc:"Step right 1/4 turn, spin 1/2 turn right stepping left back, spin 1/4 turn right stepping right to side.",needsTurn:!0,foot:"R",counts:"1-2-3"},{name:"Weave Left",desc:"Cross the right foot over the left, step the left foot side, cross the right foot behind, step the left foot side.",foot:"R",counts:"1-2-3-4"},{name:"Weave Right",desc:"Cross the left foot over the right, step the right foot side, cross the left foot behind, step the right foot side.",foot:"L",counts:"1-2-3-4"},{name:"Jazz Box Left",desc:"Cross the left foot firmly over the right foot, step backward on the right foot, step the left foot to the left side, step the right foot beside the left.",foot:"L",counts:"1-2-3-4"},{name:"Jazz Box Right",desc:"Cross the right foot firmly over the left foot, step backward on the left foot, step the right foot to the right side, step the left foot beside the right.",foot:"R",counts:"1-2-3-4"},{name:"Jazz Box Cross Left",desc:"Cross the left foot over the right, step backward on the right, step the left foot to the side, cross the right foot over the left.",foot:"L",counts:"1-2-3-4"},{name:"Jazz Box Cross Right",desc:"Cross the right foot over the left, step backward on the left, step the right foot to the side, cross the left foot over the right.",foot:"R",counts:"1-2-3-4"},{name:"Jazz Box Turn Left",desc:"Cross left over right, step back right, make a turn left stepping left side, close right.",needsTurn:!0,foot:"L",counts:"1-2-3-4"},{name:"Jazz Box Turn Right",desc:"Cross right over left, step back left, make a turn right stepping right side, close left.",needsTurn:!0,foot:"R",counts:"1-2-3-4"},{name:"Vaudeville Left",desc:"Cross right over left, step left diagonally back, touch right heel diagonally forward, step right together.",foot:"L",counts:"1&2&"},{name:"Vaudeville Right",desc:"Cross left over right, step right diagonally back, touch left heel diagonally forward, step left together.",foot:"R",counts:"1&2&"},{name:"Dorothy Step Left",desc:"Step the left foot diagonally forward, tightly lock the right foot behind the left, quickly step the left foot diagonally forward.",foot:"L",counts:"1-2&"},{name:"Dorothy Step Right",desc:"Step the right foot diagonally forward, tightly lock the left foot behind the right, quickly step the right foot diagonally forward.",foot:"R",counts:"1-2&"},{name:"Wizard Step Left",desc:"Step the left foot diagonally forward, tightly lock the right foot behind the left, quickly step the left foot forward.",foot:"L",counts:"1-2&"},{name:"Wizard Step Right",desc:"Step the right foot diagonally forward, tightly lock the left foot behind the right, quickly step the right foot forward.",foot:"R",counts:"1-2&"},{name:"Botafogo Left",desc:"Cross the left foot over the right, rock the right foot to the right side, recover weight onto the left foot in place.",foot:"L",counts:"1&2"},{name:"Botafogo Right",desc:"Cross the right foot over the left, rock the left foot to the left side, recover weight onto the right foot in place.",foot:"R",counts:"1&2"},{name:"Twinkle Left",desc:"Cross the left foot over the right, step the right foot slightly to the right side, close the left foot beside the right.",foot:"L",counts:"1-2-3"},{name:"Twinkle Right",desc:"Cross the right foot over the left, step the left foot slightly to the left side, close the right foot beside the left.",foot:"R",counts:"1-2-3"},{name:"Scissor Step Left",desc:"Step the left foot to the left side, slide and close the right foot to the left, cross the left foot heavily over the right.",foot:"L",counts:"1-2-3"},{name:"Scissor Step Right",desc:"Step the right foot to the right side, slide and close the left foot to the right, cross the right foot heavily over the left.",foot:"R",counts:"1-2-3"},{name:"Charleston Left",desc:"Step forward on the left foot, kick the right foot forward, step backward on the right foot, touch the left toe backward.",foot:"L",counts:"1-2-3-4"},{name:"Charleston Right",desc:"Step forward on the right foot, kick the left foot forward, step backward on the left foot, touch the right toe backward.",foot:"R",counts:"1-2-3-4"},{name:"Rocking Chair Left",desc:"Rock forward onto the left foot, recover back to the right, rock backward onto the left foot, recover forward to the right.",foot:"L",counts:"1-2-3-4"},{name:"Rocking Chair Right",desc:"Rock forward onto the right foot, recover back to the left, rock backward onto the right foot, recover forward to the left.",foot:"R",counts:"1-2-3-4"},{name:"Rumba Box Forward Left",desc:"Step left to side, close right beside left, step left forward, touch right beside left.",foot:"L",counts:"1-2-3-4"},{name:"Rumba Box Forward Right",desc:"Step right to side, close left beside right, step right forward, touch left beside right.",foot:"R",counts:"1-2-3-4"},{name:"Rumba Box Back Left",desc:"Step left to side, close right beside left, step left back, touch right beside left.",foot:"L",counts:"1-2-3-4"},{name:"Rumba Box Back Right",desc:"Step right to side, close left beside right, step right back, touch left beside right.",foot:"R",counts:"1-2-3-4"},{name:"K-Step Left",desc:"Step L diag fwd, touch R. Step R diag back, touch L. Step L diag back, touch R. Step R diag fwd, touch L.",foot:"L",counts:"1-8"},{name:"K-Step Right",desc:"Step R diag fwd, touch L. Step L diag back, touch R. Step R diag back, touch L. Step L diag fwd, touch R.",foot:"R",counts:"1-8"},{name:"V-Step Left",desc:"Step the left foot diagonally forward out, step the right foot diagonally forward out, step the left foot back to center, step the right foot back to center.",foot:"L",counts:"1-2-3-4"},{name:"V-Step Right",desc:"Step the right foot diagonally forward out, step the left foot diagonally forward out, step the right foot back to center, step the left foot back to center.",foot:"R",counts:"1-2-3-4"},{name:"Pivot Turn Left",desc:"Step forward firmly on the right foot, lock the balls of both feet, and execute a pivot turn left.",needsTurn:!0,foot:"R",counts:"1-2"},{name:"Pivot Turn Right",desc:"Step forward firmly on the left foot, lock the balls of both feet, and execute a pivot turn right.",needsTurn:!0,foot:"L",counts:"1-2"},{name:"Monterey Turn Left",desc:"Point the left toe to the side, execute a sharp spin turn left closing the left foot, point the right toe to the side, close the right foot.",needsTurn:!0,foot:"L",counts:"1-2-3-4"},{name:"Monterey Turn Right",desc:"Point the right toe to the side, execute a sharp spin turn right closing the right foot, point the left toe to the side, close the left foot.",needsTurn:!0,foot:"R",counts:"1-2-3-4"},{name:"Paddle Turn Left",desc:"Using the right foot as a center axis, repeatedly push off with the left foot to paddle the body in a circular turn left.",needsTurn:!0,foot:"L",counts:"1&2&3&4"},{name:"Paddle Turn Right",desc:"Using the left foot as a center axis, repeatedly push off with the right foot to paddle the body in a circular turn right.",needsTurn:!0,foot:"R",counts:"1&2&3&4"},{name:"Unwind Left",desc:"With legs crossed right over left, untwist the body by spinning turn left, transferring weight cleanly.",needsTurn:!0,foot:"Both",counts:"1-2"},{name:"Unwind Right",desc:"With legs crossed left over right, untwist the body by spinning turn right, transferring weight cleanly.",needsTurn:!0,foot:"Both",counts:"1-2"},{name:"Spiral Turn Left",desc:"Step the left foot forward and execute a tight turn left on the ball of the foot, allowing the right leg to spiral and wrap.",needsTurn:!0,foot:"L",counts:"1-2"},{name:"Spiral Turn Right",desc:"Step the right foot forward and execute a tight turn right on the ball of the foot, allowing the left leg to spiral and wrap.",needsTurn:!0,foot:"R",counts:"1-2"},{name:"Hinge Turn Left",desc:"Step to the side and execute a sharp pivot turn left on the ball of the foot, carrying the momentum.",needsTurn:!0,foot:"L",counts:"1-2"},{name:"Hinge Turn Right",desc:"Step to the side and execute a sharp pivot turn right on the ball of the foot, carrying the momentum.",needsTurn:!0,foot:"R",counts:"1-2"},{name:"Break Turn Left",desc:"Step forward heavily onto the right foot, arrest momentum to execute a sharp turn left, taking weight onto the left foot.",needsTurn:!0,foot:"R",counts:"1-2"},{name:"Break Turn Right",desc:"Step forward heavily onto the left foot, arrest momentum to execute a sharp turn right, taking weight onto the right foot.",needsTurn:!0,foot:"L",counts:"1-2"},{name:"Diamond Turn Left",desc:"Execute a dynamic turning Diamond sequence.",needsTurn:!0,foot:"L",counts:"1&2 3&4"},{name:"Diamond Turn Right",desc:"Execute a dynamic turning Diamond sequence.",needsTurn:!0,foot:"R",counts:"1&2 3&4"},{name:"Triple Turn Left",desc:"Execute a rapid 3-step sequence in place while heavily rotating turn left.",needsTurn:!0,foot:"L",counts:"1&2"},{name:"Triple Turn Right",desc:"Execute a rapid 3-step sequence in place while heavily rotating turn right.",needsTurn:!0,foot:"R",counts:"1&2"},{name:"Spot Turn Left",desc:"Step forward right, pivot 1/2 turn left. Step forward right, pivot 1/2 turn left.",needsTurn:!0,foot:"R",counts:"1-2-3-4"},{name:"Spot Turn Right",desc:"Step forward left, pivot 1/2 turn right. Step forward left, pivot 1/2 turn right.",needsTurn:!0,foot:"L",counts:"1-2-3-4"},{name:"Fallaway Turn Left",desc:"Step the left foot backward on the left diagonal, opening the body and executing a turn left.",needsTurn:!0,foot:"L",counts:"1-2"},{name:"Fallaway Turn Right",desc:"Step the right foot backward on the right diagonal, opening the body and executing a turn right.",needsTurn:!0,foot:"R",counts:"1-2"},{name:"Prissy Walk Left",desc:"Step the left foot forward, crossing it tightly in front of the right foot with a stylized swagger.",foot:"L",counts:"1"},{name:"Prissy Walk Right",desc:"Step the right foot forward, crossing it tightly in front of the left foot with a stylized swagger.",foot:"R",counts:"1"},{name:"Skate Left",desc:"Slide the left foot forcefully on a diagonal forward-left line, taking heavy weight onto the foot.",foot:"L",counts:"1"},{name:"Skate Right",desc:"Slide the right foot forcefully on a diagonal forward-right line, taking heavy weight onto the foot.",foot:"R",counts:"1"},{name:"Glide Left",desc:"A smooth, sliding step out to the left side.",foot:"L",counts:"1-2"},{name:"Glide Right",desc:"A smooth, sliding step out to the right side.",foot:"R",counts:"1-2"},{name:"Pigeon Toed",desc:"Travel sideways by repeatedly pointing toes together while spreading heels apart, followed by snapping heels together while spreading toes apart.",foot:"Both",counts:"1-2-3-4"},{name:"Nightclub Two Step Left",desc:"Step the left foot a long step to the left side, slightly cross rock the right foot behind the left, recover weight forward onto the left foot.",foot:"L",counts:"1-2&"},{name:"Nightclub Two Step Right",desc:"Step the right foot a long step to the right side, slightly cross rock the left foot behind the right, recover weight forward onto the right foot.",foot:"R",counts:"1-2&"},{name:"Samba Natural Basic",desc:"Dance a natural basic samba action progressing with a compact bounce and change of weight.",foot:"Both",counts:"1a2",weight:!0},{name:"Samba Reverse Basic",desc:"Dance a reverse basic samba action with compact body rotation and bounce timing.",foot:"Both",counts:"1a2",weight:!0},{name:"Samba Progressive Basic",desc:"Travel with a progressive samba basic using the characteristic samba bounce action.",foot:"Both",counts:"1a2",weight:!0},{name:"Samba Side Basic Left",desc:"Step side left, replace weight, then close with samba bounce timing.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Side Basic Right",desc:"Step side right, replace weight, then close with samba bounce timing.",foot:"R",counts:"1a2",weight:!0},{name:"Samba Outside Basic Left",desc:"Dance an outside basic beginning left with a crossed body shape and samba bounce.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Outside Basic Right",desc:"Dance an outside basic beginning right with a crossed body shape and samba bounce.",foot:"R",counts:"1a2",weight:!0},{name:"Samba Whisk Left",desc:"Step side on the left foot, sharply whisk the right foot behind the left, then recover with samba bounce.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Whisk Right",desc:"Step side on the right foot, sharply whisk the left foot behind the right, then recover with samba bounce.",foot:"R",counts:"1a2",weight:!0},{name:"Samba Walk Stationary Left",desc:"Dance a stationary samba walk beginning on the left foot with strong bounce and body rhythm.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Walk Stationary Right",desc:"Dance a stationary samba walk beginning on the right foot with strong bounce and body rhythm.",foot:"R",counts:"1a2",weight:!0},{name:"Samba Walk Promenade Left",desc:"Travel forward in promenade position beginning on the left foot using samba walk action.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Walk Promenade Right",desc:"Travel forward in promenade position beginning on the right foot using samba walk action.",foot:"R",counts:"1a2",weight:!0},{name:"Samba Walk Side Left",desc:"Use a side samba walk commencing on the left foot with compact travelling bounce.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Walk Side Right",desc:"Use a side samba walk commencing on the right foot with compact travelling bounce.",foot:"R",counts:"1a2",weight:!0},{name:"Samba Chasse Left",desc:"Dance a compact samba chasse to the left with side-close-side timing and bounce.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Chasse Right",desc:"Dance a compact samba chasse to the right with side-close-side timing and bounce.",foot:"R",counts:"1a2",weight:!0},{name:"Botafogo Left",desc:"Cross the left foot over the right, step the right foot to the side, then recover onto the left in a samba botafogo action.",foot:"L",counts:"1a2",weight:!0},{name:"Botafogo Right",desc:"Cross the right foot over the left, step the left foot to the side, then recover onto the right in a samba botafogo action.",foot:"R",counts:"1a2",weight:!0},{name:"Travelling Botafogo Forward Left",desc:"Travel forward with a botafogo action beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Travelling Botafogo Forward Right",desc:"Travel forward with a botafogo action beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Travelling Botafogo Back Left",desc:"Travel backward with a botafogo action beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Travelling Botafogo Back Right",desc:"Travel backward with a botafogo action beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Travelling Botafogo to Promenade Left",desc:"Travel with a botafogo action ending into promenade position beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Travelling Botafogo to Promenade Right",desc:"Travel with a botafogo action ending into promenade position beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Promenade to Counter Promenade Botafogos Left",desc:"Alternate botafogo shaping from promenade to counter-promenade beginning left.",foot:"L",counts:"1a2 3a4",weight:!0},{name:"Promenade to Counter Promenade Botafogos Right",desc:"Alternate botafogo shaping from promenade to counter-promenade beginning right.",foot:"R",counts:"1a2 3a4",weight:!0},{name:"Contra Botafogo Left",desc:"Dance a contra-position botafogo beginning on the left foot with opposing body shape.",foot:"L",counts:"1a2",weight:!0},{name:"Contra Botafogo Right",desc:"Dance a contra-position botafogo beginning on the right foot with opposing body shape.",foot:"R",counts:"1a2",weight:!0},{name:"Criss Cross Botafogo Left",desc:"Dance a criss cross botafogo in shadow-style alignment beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Criss Cross Botafogo Right",desc:"Dance a criss cross botafogo in shadow-style alignment beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Same Foot Botafogo Left",desc:"Use same-foot botafogo timing beginning from the left side lead.",foot:"L",counts:"1a2",weight:!0},{name:"Same Foot Botafogo Right",desc:"Use same-foot botafogo timing beginning from the right side lead.",foot:"R",counts:"1a2",weight:!0},{name:"Volta Travelling Left",desc:"Travel left using samba volta action with repeated ball-flat-close rhythm.",foot:"L",counts:"1a2",weight:!0},{name:"Volta Travelling Right",desc:"Travel right using samba volta action with repeated ball-flat-close rhythm.",foot:"R",counts:"1a2",weight:!0},{name:"Volta Criss Cross Left",desc:"Travel in criss cross samba volta action beginning left.",foot:"L",counts:"1a2",weight:!0},{name:"Volta Criss Cross Right",desc:"Travel in criss cross samba volta action beginning right.",foot:"R",counts:"1a2",weight:!0},{name:"Volta Spot Left",desc:"Dance a solo spot volta turning left with samba bounce timing.",foot:"L",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Spot Right",desc:"Dance a solo spot volta turning right with samba bounce timing.",foot:"R",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Spot Continuous Left",desc:"Continue consecutive solo spot voltas turning left.",foot:"L",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Volta Spot Continuous Right",desc:"Continue consecutive solo spot voltas turning right.",foot:"R",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Volta Circular Left",desc:"Dance circular samba voltas turning left around a compact circle.",foot:"L",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Circular Right",desc:"Dance circular samba voltas turning right around a compact circle.",foot:"R",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Circular Solo Left",desc:"Dance solo circular samba voltas turning left.",foot:"L",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Circular Solo Right",desc:"Dance solo circular samba voltas turning right.",foot:"R",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Shadow Circular Left",desc:"Dance a shadow circular volta turning left while maintaining shadow alignment.",foot:"L",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Shadow Circular Right",desc:"Dance a shadow circular volta turning right while maintaining shadow alignment.",foot:"R",counts:"1a2",weight:!0,needsTurn:!0},{name:"Volta Shadow Travelling Left",desc:"Travel in shadow position using volta action to the left.",foot:"L",counts:"1a2",weight:!0},{name:"Volta Shadow Travelling Right",desc:"Travel in shadow position using volta action to the right.",foot:"R",counts:"1a2",weight:!0},{name:"Volta Dropped Left",desc:"Dance a dropped volta beginning left with the characteristic lowered samba action.",foot:"L",counts:"1a2",weight:!0},{name:"Volta Dropped Right",desc:"Dance a dropped volta beginning right with the characteristic lowered samba action.",foot:"R",counts:"1a2",weight:!0},{name:"Cruzados Walk Left",desc:"Dance a forward cruzado walk crossing and projecting the left side lead.",foot:"L",counts:"1a2",weight:!0},{name:"Cruzados Walk Right",desc:"Dance a forward cruzado walk crossing and projecting the right side lead.",foot:"R",counts:"1a2",weight:!0},{name:"Cruzados Lock Left",desc:"Dance a cruzados lock progression beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Cruzados Lock Right",desc:"Dance a cruzados lock progression beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Cruzados Lock Continuous Left",desc:"Continue repeated cruzados locks travelling from a left-foot start.",foot:"L",counts:"1a2 3a4",weight:!0},{name:"Cruzados Lock Continuous Right",desc:"Continue repeated cruzados locks travelling from a right-foot start.",foot:"R",counts:"1a2 3a4",weight:!0},{name:"Samba Lock Left Side",desc:"Dance samba locks with the lady or body line on the left side alignment.",foot:"L",counts:"1a2",weight:!0},{name:"Samba Lock Right Side",desc:"Dance samba locks with the lady or body line on the right side alignment.",foot:"R",counts:"1a2",weight:!0},{name:"Natural Roll Samba Left",desc:"Dance a natural roll samba turn progressing left-to-right through the body.",foot:"L",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Natural Roll Samba Right",desc:"Dance a natural roll samba turn progressing right-to-left through the body.",foot:"R",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Reverse Roll Samba Left",desc:"Dance a reverse roll samba turn beginning on the left side lead.",foot:"L",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Reverse Roll Samba Right",desc:"Dance a reverse roll samba turn beginning on the right side lead.",foot:"R",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Close Rocks Samba Left",desc:"Dance close rocks in samba timing beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Close Rocks Samba Right",desc:"Dance close rocks in samba timing beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Open Rocks Samba Left",desc:"Dance open rocks in samba timing beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Open Rocks Samba Right",desc:"Dance open rocks in samba timing beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Backward Rocks Samba Left",desc:"Dance backward rocks in samba timing beginning on the left foot.",foot:"L",counts:"1a2",weight:!0},{name:"Backward Rocks Samba Right",desc:"Dance backward rocks in samba timing beginning on the right foot.",foot:"R",counts:"1a2",weight:!0},{name:"Maypole Samba Left",desc:"Dance a maypole samba figure with left-turning lead action.",foot:"L",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Maypole Samba Right",desc:"Dance a maypole samba figure with right-turning lead action.",foot:"R",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Corta Jaca Left",desc:"Dance corta jaca styling beginning on the left side lead with crossed samba body action.",foot:"L",counts:"1a2",weight:!0},{name:"Corta Jaca Right",desc:"Dance corta jaca styling beginning on the right side lead with crossed samba body action.",foot:"R",counts:"1a2",weight:!0},{name:"Corta Jaca Same Position Left",desc:"Dance same-position corta jaca beginning from a left-foot lead.",foot:"L",counts:"1a2",weight:!0},{name:"Corta Jaca Same Position Right",desc:"Dance same-position corta jaca beginning from a right-foot lead.",foot:"R",counts:"1a2",weight:!0},{name:"Plait Samba Left",desc:"Dance the plait figure beginning on the left foot, weaving the body line through samba timing.",foot:"L",counts:"1a2 3a4",weight:!0},{name:"Plait Samba Right",desc:"Dance the plait figure beginning on the right foot, weaving the body line through samba timing.",foot:"R",counts:"1a2 3a4",weight:!0},{name:"Rolling Off The Arm Left",desc:"Roll off the arm beginning left, using samba walk and turn action to travel away and re-shape.",foot:"L",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Rolling Off The Arm Right",desc:"Roll off the arm beginning right, using samba walk and turn action to travel away and re-shape.",foot:"R",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Promenade Runs Samba Left",desc:"Run through promenade and counter-promenade samba action beginning left.",foot:"L",counts:"1a2 3a4",weight:!0},{name:"Promenade Runs Samba Right",desc:"Run through promenade and counter-promenade samba action beginning right.",foot:"R",counts:"1a2 3a4",weight:!0},{name:"Carioca Runs Samba Left",desc:"Travel with carioca runs beginning left using compact samba leg action.",foot:"L",counts:"1a2 3a4",weight:!0},{name:"Carioca Runs Samba Right",desc:"Travel with carioca runs beginning right using compact samba leg action.",foot:"R",counts:"1a2 3a4",weight:!0},{name:"Argentine Crosses Samba Left",desc:"Dance Argentine crosses in samba timing beginning on the left foot.",foot:"L",counts:"1a2 3a4",weight:!0},{name:"Argentine Crosses Samba Right",desc:"Dance Argentine crosses in samba timing beginning on the right foot.",foot:"R",counts:"1a2 3a4",weight:!0},{name:"Samba Rhythm Bounce",desc:"Use the characteristic samba bounce rhythm in place through the knees and body.",foot:"Both",counts:"1a2",weight:!1},{name:"Samba Drag Left",desc:"Drag the left foot with controlled samba bounce and delayed body timing.",foot:"L",counts:"1-2",weight:!1},{name:"Samba Drag Right",desc:"Drag the right foot with controlled samba bounce and delayed body timing.",foot:"R",counts:"1-2",weight:!1},{name:"Samba Foot Change Method 1",desc:"Execute samba foot change method 1 to switch the working foot without breaking timing.",foot:"Both",counts:"1a2",weight:!0},{name:"Samba Foot Change Method 2",desc:"Execute samba foot change method 2 to switch the working foot without breaking timing.",foot:"Both",counts:"1a2",weight:!0},{name:"Samba Foot Change Method 3",desc:"Execute samba foot change method 3 to switch the working foot without breaking timing.",foot:"Both",counts:"1a2",weight:!0},{name:"Samba Underarm Turn Left",desc:"Lead or dance an underarm samba turn to the left with compact bounce timing.",foot:"L",counts:"1a2",weight:!0,needsTurn:!0},{name:"Samba Underarm Turn Right",desc:"Lead or dance an underarm samba turn to the right with compact bounce timing.",foot:"R",counts:"1a2",weight:!0,needsTurn:!0},{name:"Samba Reverse Turn Left",desc:"Dance a reverse turn in samba beginning on the left side lead.",foot:"L",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Samba Reverse Turn Right",desc:"Dance a reverse turn in samba beginning on the right side lead.",foot:"R",counts:"1a2 3a4",weight:!0,needsTurn:!0},{name:"Restart Marker",desc:"A choreographic command to abort the current sequence and restart the entire dance from count 1.",foot:"None",counts:"0",weight:!1},{name:"Tag Marker",desc:"A distinct, extra sequence of choreography inserted specifically to keep the phrasing synchronized with the music.",foot:"None",counts:"0",weight:!1},{name:"Bridge Marker",desc:"An additional sequence of choreography added to match a break in the standard musical phrasing.",foot:"None",counts:"0",weight:!1},{name:"Across Left",desc:"Step the left foot across and in front of the right foot.",foot:"L",counts:"1",weight:!0},{name:"Across Right",desc:"Step the right foot across and in front of the left foot.",foot:"R",counts:"1",weight:!0},{name:"Ankle Rock Left",desc:"With the feet crossed and ankles locked, rock weight onto the forward left foot, then recover to the back right foot.",foot:"L",counts:"1-2",weight:!0},{name:"Ankle Rock Right",desc:"With the feet crossed and ankles locked, rock weight onto the forward right foot, then recover to the back left foot.",foot:"R",counts:"1-2",weight:!0},{name:"Apple Jack Left",desc:"Take weight onto the left heel and right toe, swivel the left toe and right heel to the left side, then return to centre.",foot:"L",counts:"1&2",weight:!1},{name:"Apple Jack Right",desc:"Take weight onto the right heel and left toe, swivel the right toe and left heel to the right side, then return to centre.",foot:"R",counts:"1&2",weight:!1},{name:"Balance 1/2 Turn Left",desc:"Step forward on the left foot, step forward on the right foot, then pivot 1/2 turn left.",foot:"L",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Balance 1/2 Turn Right",desc:"Step forward on the right foot, step forward on the left foot, then pivot 1/2 turn right.",foot:"R",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Balance Step Back Left",desc:"Step back on the left foot, close the right foot beside the left, then step the left foot in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Balance Step Back Right",desc:"Step back on the right foot, close the left foot beside the right, then step the right foot in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Balance Step Forward Left",desc:"Step forward on the left foot, close the right foot beside the left, then step the left foot in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Balance Step Forward Right",desc:"Step forward on the right foot, close the left foot beside the right, then step the right foot in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Ball Change Left",desc:"Step quickly onto the ball of the left foot, then change weight back to the right foot.",foot:"L",counts:"&1",weight:!0},{name:"Ball Change Right",desc:"Step quickly onto the ball of the right foot, then change weight back to the left foot.",foot:"R",counts:"&1",weight:!0},{name:"Boogie Left",desc:"Lift and circle the free hip away from the weighted foot with a boogie styling action.",foot:"L",counts:"1",weight:!1},{name:"Boogie Right",desc:"Lift and circle the free hip away from the weighted foot with a boogie styling action.",foot:"R",counts:"1",weight:!1},{name:"Boogie Roll Left",desc:"Use a bent supporting knee and roll the left hip in a circular boogie action while the hip stays back.",foot:"L",counts:"1-2",weight:!1},{name:"Boogie Roll Right",desc:"Use a bent supporting knee and roll the right hip in a circular boogie action while the hip stays back.",foot:"R",counts:"1-2",weight:!1},{name:"Boogie Walk Left",desc:"Move forward by lifting the hip and stepping onto the left foot in a circular boogie action.",foot:"L",counts:"1",weight:!0},{name:"Boogie Walk Right",desc:"Move forward by lifting the hip and stepping onto the right foot in a circular boogie action.",foot:"R",counts:"1",weight:!0},{name:"Body Roll",desc:"Ripple the body smoothly upward or downward through the torso over the stated counts.",foot:"Both",counts:"1-2",weight:!1},{name:"Box Step Forward Left",desc:"Step forward on the left foot, close the right foot beside the left, step the left foot to the side, then touch the right foot beside the left.",foot:"L",counts:"1-2-3-4",weight:!0},{name:"Box Step Forward Right",desc:"Step forward on the right foot, close the left foot beside the right, step the right foot to the side, then touch the left foot beside the right.",foot:"R",counts:"1-2-3-4",weight:!0},{name:"Box Step Side Left",desc:"Step the left foot to the side, close the right foot beside the left, step forward on the left foot, then touch the right foot beside the left.",foot:"L",counts:"1-2-3-4",weight:!0},{name:"Box Step Side Right",desc:"Step the right foot to the side, close the left foot beside the right, step forward on the right foot, then touch the left foot beside the right.",foot:"R",counts:"1-2-3-4",weight:!0},{name:"Break Step Left",desc:"Step strongly onto the left foot to break the flow and prepare the following action.",foot:"L",counts:"1",weight:!0},{name:"Break Step Right",desc:"Step strongly onto the right foot to break the flow and prepare the following action.",foot:"R",counts:"1",weight:!0},{name:"Bump Left",desc:"Push the hip sharply to the left side.",foot:"L",counts:"1",weight:!1},{name:"Bump Right",desc:"Push the hip sharply to the right side.",foot:"R",counts:"1",weight:!1},{name:"Brush Back Across Left",desc:"Brush the ball of the left foot backward and across behind the right leg.",foot:"L",counts:"1",weight:!1},{name:"Brush Back Across Right",desc:"Brush the ball of the right foot backward and across behind the left leg.",foot:"R",counts:"1",weight:!1},{name:"Cha Cha Left",desc:"Triple step in place stepping left, right, left.",foot:"L",counts:"1&2",weight:!0},{name:"Cha Cha Right",desc:"Triple step in place stepping right, left, right.",foot:"R",counts:"1&2",weight:!0},{name:"Charleston Kick Left",desc:"Kick the left foot forward, step the left foot beside the right, touch the right toe back, then step the right foot beside the left.",foot:"L",counts:"1-2-3-4",weight:!0},{name:"Charleston Kick Right",desc:"Kick the right foot forward, step the right foot beside the left, touch the left toe back, then step the left foot beside the right.",foot:"R",counts:"1-2-3-4",weight:!0},{name:"Chug Left",desc:"With weight on the ball of the right foot, lift the left foot slightly and scoot forward.",foot:"L",counts:"1",weight:!1},{name:"Chug Right",desc:"With weight on the ball of the left foot, lift the right foot slightly and scoot forward.",foot:"R",counts:"1",weight:!1},{name:"Cross Unwind Left",desc:"Cross the right foot over the left, then unwind turn left.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Cross Unwind Right",desc:"Cross the left foot over the right, then unwind turn right.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Crossing Triple Left",desc:"Cross the left foot over the right, step the right foot to the side, then cross the left foot over the right again.",foot:"L",counts:"1&2",weight:!0},{name:"Crossing Triple Right",desc:"Cross the right foot over the left, step the left foot to the side, then cross the right foot over the left again.",foot:"R",counts:"1&2",weight:!0},{name:"Cuban Motion Left",desc:"Use the natural Latin-style hip action while transferring weight onto the left foot.",foot:"L",counts:"1",weight:!1},{name:"Cuban Motion Right",desc:"Use the natural Latin-style hip action while transferring weight onto the right foot.",foot:"R",counts:"1",weight:!1},{name:"Dig Left",desc:"Dig the left heel or toe firmly into the floor with emphasis.",foot:"L",counts:"1",weight:!1},{name:"Dig Right",desc:"Dig the right heel or toe firmly into the floor with emphasis.",foot:"R",counts:"1",weight:!1},{name:"Fan Left",desc:"Fan the left toe or heel outward, then return to centre as written.",foot:"L",counts:"1-2",weight:!1},{name:"Fan Right",desc:"Fan the right toe or heel outward, then return to centre as written.",foot:"R",counts:"1-2",weight:!1},{name:"Freeze",desc:"Stop all movement and hold the body still for the specified count.",foot:"None",counts:"1",weight:!1},{name:"Heel Ball Change Left",desc:"Touch the left heel forward, step onto the ball of the left foot, then step the right foot in place.",foot:"L",counts:"1&2",weight:!0},{name:"Heel Ball Change Right",desc:"Touch the right heel forward, step onto the ball of the right foot, then step the left foot in place.",foot:"R",counts:"1&2",weight:!0},{name:"Heel Ball Cross Left",desc:"Touch the left heel forward, step the left foot slightly back, then cross the right foot over the left.",foot:"L",counts:"1&2",weight:!0},{name:"Heel Ball Cross Right",desc:"Touch the right heel forward, step the right foot slightly back, then cross the left foot over the right.",foot:"R",counts:"1&2",weight:!0},{name:"Heel Fan Left",desc:"Fan the left heel out to the left side, then return it to centre.",foot:"L",counts:"1-2",weight:!1},{name:"Heel Fan Right",desc:"Fan the right heel out to the right side, then return it to centre.",foot:"R",counts:"1-2",weight:!1},{name:"Heel Grind Left",desc:"Rock forward on the left heel and arc the left toe from right to left, then recover weight back to the right foot.",foot:"L",counts:"1-2",weight:!0},{name:"Heel Grind Right",desc:"Rock forward on the right heel and arc the right toe from left to right, then recover weight back to the left foot.",foot:"R",counts:"1-2",weight:!0},{name:"Heel Grind Turning Left",desc:"Step onto the left heel and execute a turning heel grind left while recovering back.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Heel Grind Turning Right",desc:"Step onto the right heel and execute a turning heel grind right while recovering back.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Heel Jack Left",desc:"Step diagonally back on the right foot, touch the left heel diagonally forward, step the left foot in place, then touch or step the right foot beside the left.",foot:"R",counts:"&1&2",weight:!0},{name:"Heel Jack Right",desc:"Step diagonally back on the left foot, touch the right heel diagonally forward, step the right foot in place, then touch or step the left foot beside the right.",foot:"L",counts:"&1&2",weight:!0},{name:"Heel Pivot Left",desc:"Step, pivot the heels left, then step out of the pivot.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Heel Pivot Right",desc:"Step, pivot the heels right, then step out of the pivot.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Heel Strut Left",desc:"Step forward on the left heel, then drop the left toe to the floor taking weight.",foot:"L",counts:"1-2",weight:!0},{name:"Heel Strut Right",desc:"Step forward on the right heel, then drop the right toe to the floor taking weight.",foot:"R",counts:"1-2",weight:!0},{name:"Heel Swivets Left",desc:"Fan the left heel and right toe to the left side, then return to centre.",foot:"L",counts:"1-2",weight:!1},{name:"Heel Swivets Right",desc:"Fan the right heel and left toe to the right side, then return to centre.",foot:"R",counts:"1-2",weight:!1},{name:"Heel Turn Left",desc:"Execute a heel-led turn to the left, keeping the turn controlled on the heels.",foot:"Both",counts:"1-2",weight:!0,needsTurn:!0},{name:"Heel Turn Right",desc:"Execute a heel-led turn to the right, keeping the turn controlled on the heels.",foot:"Both",counts:"1-2",weight:!0,needsTurn:!0},{name:"Heel Twist Left",desc:"Twist both heels to the left side, then return to centre.",foot:"Both",counts:"1-2",weight:!1},{name:"Heel Twist Right",desc:"Twist both heels to the right side, then return to centre.",foot:"Both",counts:"1-2",weight:!1},{name:"Hip Bumps Back Left",desc:"Step back on the left foot and bump the hips left, right, left.",foot:"L",counts:"1&2",weight:!0},{name:"Hip Bumps Back Right",desc:"Step back on the right foot and bump the hips right, left, right.",foot:"R",counts:"1&2",weight:!0},{name:"Hip Bumps Forward Left",desc:"Step forward on the left foot and bump the hips left, right, left.",foot:"L",counts:"1&2",weight:!0},{name:"Hip Bumps Forward Right",desc:"Step forward on the right foot and bump the hips right, left, right.",foot:"R",counts:"1&2",weight:!0},{name:"Hip Lift Left",desc:"Lift the left hip upward while keeping the body poised over the supporting leg.",foot:"L",counts:"1",weight:!1},{name:"Hip Lift Right",desc:"Lift the right hip upward while keeping the body poised over the supporting leg.",foot:"R",counts:"1",weight:!1},{name:"Hip Roll Left",desc:"Roll the hips in a circular action to the left side.",foot:"L",counts:"1-2-3-4",weight:!1},{name:"Hip Roll Right",desc:"Roll the hips in a circular action to the right side.",foot:"R",counts:"1-2-3-4",weight:!1},{name:"Hold",desc:"Hold the current position for the specified count without moving the feet.",foot:"None",counts:"1",weight:!1},{name:"Hop Left",desc:"Hop on the left foot and land on the left foot.",foot:"L",counts:"1",weight:!0},{name:"Hop Right",desc:"Hop on the right foot and land on the right foot.",foot:"R",counts:"1",weight:!0},{name:"Jump",desc:"Spring into the air and land cleanly on both feet.",foot:"Both",counts:"1",weight:!0},{name:"Jumping Jacks",desc:"Jump and land with the feet apart, then jump again returning the feet together.",foot:"Both",counts:"1-2",weight:!0},{name:"Leap Left",desc:"Spring from the supporting foot and land on the left foot.",foot:"L",counts:"1",weight:!0},{name:"Leap Right",desc:"Spring from the supporting foot and land on the right foot.",foot:"R",counts:"1",weight:!0},{name:"Lock Step Forward Left",desc:"Step forward on the left foot, lock the right foot behind the left, then step forward on the left foot.",foot:"L",counts:"1&2",weight:!0},{name:"Lock Step Forward Right",desc:"Step forward on the right foot, lock the left foot behind the right, then step forward on the right foot.",foot:"R",counts:"1&2",weight:!0},{name:"Lock Step Back Left",desc:"Step back on the left foot, lock the right foot across the front of the left, then step back on the left foot.",foot:"L",counts:"1&2",weight:!0},{name:"Lock Step Back Right",desc:"Step back on the right foot, lock the left foot across the front of the right, then step back on the right foot.",foot:"R",counts:"1&2",weight:!0},{name:"Louie Louie",desc:"With weight on the balls of the feet, swivel both heels inward and then return them to centre.",foot:"Both",counts:"1-2",weight:!1},{name:"Mashed Potatoes Left",desc:"Step back on the left foot with the heel turned inward, then quickly swivel the heel outward.",foot:"L",counts:"1&2",weight:!0},{name:"Mashed Potatoes Right",desc:"Step back on the right foot with the heel turned inward, then quickly swivel the heel outward.",foot:"R",counts:"1&2",weight:!0},{name:"Press Left",desc:"Press the left foot forward with partial weight and a bent knee.",foot:"L",counts:"1",weight:!1},{name:"Press Right",desc:"Press the right foot forward with partial weight and a bent knee.",foot:"R",counts:"1",weight:!1},{name:"Reverse Pivot Turn Left",desc:"Step the right foot back and execute a reverse pivot turn left.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Reverse Pivot Turn Right",desc:"Step the left foot back and execute a reverse pivot turn right.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Reverse Rocking Chair Left",desc:"Rock back on the left foot, recover to the right, rock forward on the left foot, then recover to the right.",foot:"L",counts:"1-2-3-4",weight:!0},{name:"Reverse Rocking Chair Right",desc:"Rock back on the right foot, recover to the left, rock forward on the right foot, then recover to the left.",foot:"R",counts:"1-2-3-4",weight:!0},{name:"Ronde de Jambe Left",desc:"With weight on the right foot, sweep the left toe in a circular arc around the floor.",foot:"L",counts:"1-2",weight:!1},{name:"Ronde de Jambe Right",desc:"With weight on the left foot, sweep the right toe in a circular arc around the floor.",foot:"R",counts:"1-2",weight:!1},{name:"Run Run Run Left",desc:"Take three quick running steps beginning with the left foot.",foot:"L",counts:"1&2",weight:!0},{name:"Run Run Run Right",desc:"Take three quick running steps beginning with the right foot.",foot:"R",counts:"1&2",weight:!0},{name:"Scoot Left",desc:"Hop or scoot forward on the left foot while the other foot is lifted.",foot:"L",counts:"1",weight:!0},{name:"Scoot Right",desc:"Hop or scoot forward on the right foot while the other foot is lifted.",foot:"R",counts:"1",weight:!0},{name:"Scuff Left",desc:"Scuff the left heel forward across the floor.",foot:"L",counts:"1",weight:!1},{name:"Scuff Right",desc:"Scuff the right heel forward across the floor.",foot:"R",counts:"1",weight:!1},{name:"Shimmy",desc:"Move the shoulders rapidly in alternating directions.",foot:"Both",counts:"1-2",weight:!1},{name:"Side Close Side Left",desc:"Step the left foot to the side, close the right foot beside it, then step the left foot to the side again.",foot:"L",counts:"1&2",weight:!0},{name:"Side Close Side Right",desc:"Step the right foot to the side, close the left foot beside it, then step the right foot to the side again.",foot:"R",counts:"1&2",weight:!0},{name:"Skip Left",desc:"Skip forward beginning on the left foot with a light springing action.",foot:"L",counts:"1&2",weight:!0},{name:"Skip Right",desc:"Skip forward beginning on the right foot with a light springing action.",foot:"R",counts:"1&2",weight:!0},{name:"Slide Left",desc:"Slide the left foot toward or away from the supporting foot while keeping contact with the floor.",foot:"L",counts:"1-2",weight:!1},{name:"Slide Right",desc:"Slide the right foot toward or away from the supporting foot while keeping contact with the floor.",foot:"R",counts:"1-2",weight:!1},{name:"Spin Left",desc:"Spin on the ball of the supporting foot turning left.",foot:"L",counts:"1",weight:!0,needsTurn:!0},{name:"Spin Right",desc:"Spin on the ball of the supporting foot turning right.",foot:"R",counts:"1",weight:!0,needsTurn:!0},{name:"Stride Left",desc:"Take a large stride on the left foot.",foot:"L",counts:"1-2",weight:!0},{name:"Stride Right",desc:"Take a large stride on the right foot.",foot:"R",counts:"1-2",weight:!0},{name:"Stroll Left",desc:"Step forward on the left foot, step forward on the right foot, then continue the strolling action.",foot:"L",counts:"1-2",weight:!0},{name:"Stroll Right",desc:"Step forward on the right foot, step forward on the left foot, then continue the strolling action.",foot:"R",counts:"1-2",weight:!0},{name:"Sugarfoot Left",desc:"Touch the left toe to the right instep, then touch the left heel to the right instep.",foot:"L",counts:"1-2",weight:!1},{name:"Sugarfoot Right",desc:"Touch the right toe to the left instep, then touch the right heel to the left instep.",foot:"R",counts:"1-2",weight:!1},{name:"Sugarfoot Swivel Left",desc:"Swivel the left heel while touching the right toe and heel to the left instep in sugarfoot styling.",foot:"L",counts:"1-2",weight:!1},{name:"Sugarfoot Swivel Right",desc:"Swivel the right heel while touching the left toe and heel to the right instep in sugarfoot styling.",foot:"R",counts:"1-2",weight:!1},{name:"Sweep Left",desc:"Sweep the left foot in an arc from front to back or back to front.",foot:"L",counts:"1-2",weight:!1},{name:"Sweep Right",desc:"Sweep the right foot in an arc from front to back or back to front.",foot:"R",counts:"1-2",weight:!1},{name:"Swivel Left",desc:"Take weight onto the left heel and right toe, swivel both toes to the left side, then return to centre.",foot:"L",counts:"1-2",weight:!1},{name:"Swivel Right",desc:"Take weight onto the right heel and left toe, swivel both toes to the right side, then return to centre.",foot:"R",counts:"1-2",weight:!1},{name:"Syncopated Grapevine Left",desc:"Step the left foot to the side, cross the right foot behind, step the left foot to the side, then cross the right foot over using syncopated timing.",foot:"L",counts:"1&2&",weight:!0},{name:"Syncopated Grapevine Right",desc:"Step the right foot to the side, cross the left foot behind, step the right foot to the side, then cross the left foot over using syncopated timing.",foot:"R",counts:"1&2&",weight:!0},{name:"Toe Fan Left",desc:"Fan the left toe out to the left side, then return it to centre.",foot:"L",counts:"1-2",weight:!1},{name:"Toe Fan Right",desc:"Fan the right toe out to the right side, then return it to centre.",foot:"R",counts:"1-2",weight:!1},{name:"Toe Heel Cross Left",desc:"Touch the left toe beside the right foot, touch the left heel to the side, then cross the left foot over the right.",foot:"L",counts:"1&2",weight:!0},{name:"Toe Heel Cross Right",desc:"Touch the right toe beside the left foot, touch the right heel to the side, then cross the right foot over the left.",foot:"R",counts:"1&2",weight:!0},{name:"Toe Strut Back Left",desc:"Step the left toe back, then drop the left heel taking weight.",foot:"L",counts:"1-2",weight:!0},{name:"Toe Strut Back Right",desc:"Step the right toe back, then drop the right heel taking weight.",foot:"R",counts:"1-2",weight:!0},{name:"Toe Strut Forward Left",desc:"Step forward on the left toe, then drop the heel taking weight.",foot:"L",counts:"1-2",weight:!0},{name:"Toe Strut Forward Right",desc:"Step forward on the right toe, then drop the heel taking weight.",foot:"R",counts:"1-2",weight:!0},{name:"Toe Switches Left",desc:"Touch the left toe forward or to the side, step the left foot in place, then repeat with the right foot.",foot:"L",counts:"1&2&",weight:!0},{name:"Toe Switches Right",desc:"Touch the right toe forward or to the side, step the right foot in place, then repeat with the left foot.",foot:"R",counts:"1&2&",weight:!0},{name:"Traveling Applejacks Left",desc:"Travel sideways left by alternating toe-in and heel-in swivels in applejack styling.",foot:"L",counts:"1&2&",weight:!1},{name:"Traveling Applejacks Right",desc:"Travel sideways right by alternating toe-in and heel-in swivels in applejack styling.",foot:"R",counts:"1&2&",weight:!1},{name:"Turn In",desc:"Rotate the toes or knees inward toward the centre.",foot:"Both",counts:"1",weight:!1},{name:"Turn Out",desc:"Rotate the toes or knees outward away from the centre.",foot:"Both",counts:"1",weight:!1},{name:"Weight Change",desc:"Transfer weight cleanly from one foot to the other.",foot:"Both",counts:"1",weight:!0},{name:"Willies",desc:"Travel forward with a pigeon-toed action, keeping weight on the balls of the feet.",foot:"Both",counts:"1-2-3-4",weight:!0},{name:"Syncopated Weave Left",desc:"Step left to left side, step right behind left, step left to left side, cross right over left, step left to left side.",foot:"L",counts:"1-2&3-4",weight:!0},{name:"Syncopated Weave Right",desc:"Step right to right side, step left behind right, step right to right side, cross left over right, step right to right side.",foot:"R",counts:"1-2&3-4",weight:!0},{name:"Grapevine Turn Left",desc:"Step the left foot to the side, cross the right foot behind, then step the left foot turning left.",foot:"L",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Grapevine Turn Right",desc:"Step the right foot to the side, cross the left foot behind, then step the right foot turning right.",foot:"R",counts:"1-2-3",weight:!0,needsTurn:!0}],Yd=e=>{const t=String((e==null?void 0:e.name)||""),r=e==null?void 0:e.foot;if(!(r==="L"||r==="R"))return null;const o=r==="L"?"left":"right",n=r==="L"?"right":"left",i=/\bLeft\b/i.test(t)?"left":/\bRight\b/i.test(t)?"right":o;return/^Nightclub (Two Step|Basic)\b/i.test(t)?`Big step ${o} to ${o} side, rock ${n} slightly behind ${o}, recover onto ${o}.`:/^Behind Side Cross Point\b/i.test(t)?`Step ${o} behind ${n}, step ${n} to ${n} side, cross ${o} over ${n}, point ${n} to ${n} side.`:/^Behind Side Cross Touch\b/i.test(t)?`Step ${o} behind ${n}, step ${n} to ${n} side, cross ${o} over ${n}, touch ${n} beside ${o}.`:/^Behind Side Cross Hold\b/i.test(t)?`Step ${o} behind ${n}, step ${n} to ${n} side, cross ${o} over ${n}, hold.`:/^Behind Side Cross Sweep\b/i.test(t)?`Step ${o} behind ${n}, step ${n} to ${n} side, cross ${o} over ${n}, sweep ${n} from back to front.`:/^Behind Side Cross 1\/4 Turn\b/i.test(t)?`Step ${o} behind ${n}, step ${n} to ${n} side, turn 1/4 ${i} crossing ${o} over ${n}.`:/^Behind Side Cross Rock\b/i.test(t)?`Step ${o} behind ${n}, step ${n} to ${n} side, cross rock ${o} over ${n}, recover onto ${n}.`:/^(Syncopated )?Behind Side Cross\b/i.test(t)?`Step ${o} behind ${n}, step ${n} to ${n} side, cross ${o} over ${n}.`:/^Sailor Step\b/i.test(t)?`Cross ${o} behind ${n}, step ${n} to ${n} side, step ${o} in place.`:/^Sailor Cross\b/i.test(t)?`Cross ${o} behind ${n}, step ${n} to ${n} side, cross ${o} over ${n}.`:/^Sailor Turn\b/i.test(t)?`Cross ${o} behind ${n} turning ${i}, step ${n} to ${n} side, step ${o} slightly forward.`:/^Grapevine Turn Left\b/i.test(t)?"Step left to left side, cross right behind left, step left turning left.":/^Grapevine Turn Right\b/i.test(t)?"Step right to right side, cross left behind right, step right turning right.":/^Grapevine Left\b/i.test(t)?"Step left to left side, cross right behind left, step left to left side.":/^Grapevine Right\b/i.test(t)?"Step right to right side, cross left behind right, step right to right side.":/^Weave Left\b/i.test(t)?"Cross right over left, step left to left side, cross right behind left, step left to left side.":/^Weave Right\b/i.test(t)?"Cross left over right, step right to right side, cross left behind right, step right to right side.":/^Syncopated Weave Left\b/i.test(t)?"Step left to left side, step right behind left, step left to left side, cross right over left, step left to left side.":/^Syncopated Weave Right\b/i.test(t)?"Step right to right side, step left behind right, step right to right side, cross left over right, step right to right side.":/^Rolling Vine Left\b/i.test(t)?"Turn 1/4 left stepping left forward, turn 1/2 left stepping right back, turn 1/4 left stepping left to left side.":/^Rolling Vine Right\b/i.test(t)?"Turn 1/4 right stepping right forward, turn 1/2 right stepping left back, turn 1/4 right stepping right to right side.":/^Jazz Box Turn\b/i.test(t)?`Cross ${o} over ${n}, turn ${i} stepping ${n} back, step ${o} to ${o} side, step ${n} slightly forward.`:/^Jazz Box Cross\b/i.test(t)?`Cross ${o} over ${n}, step ${n} back, step ${o} to ${o} side, cross ${n} over ${o}.`:/^Jazz Box\b/i.test(t)?`Cross ${o} over ${n}, step ${n} back, step ${o} to ${o} side, step ${n} beside ${o}.`:/^Mambo Forward\b/i.test(t)?`Rock ${o} forward, recover onto ${n}, step ${o} beside ${n}.`:/^Mambo Back\b/i.test(t)?`Rock ${o} back, recover onto ${n}, step ${o} beside ${n}.`:/^Mambo Side\b/i.test(t)?`Rock ${o} to ${o} side, recover onto ${n}, step ${o} beside ${n}.`:/^Mambo Cross\b/i.test(t)?`Rock ${o} to ${o} side, recover onto ${n}, cross ${o} over ${n}.`:/^Coaster Step Forward\b/i.test(t)?`Step ${o} forward, close ${n} beside ${o}, step ${o} back.`:/^Coaster Step Back\b/i.test(t)?`Step ${o} back, close ${n} beside ${o}, step ${o} forward.`:/^Coaster Cross\b/i.test(t)?`Step ${o} back, close ${n} beside ${o}, cross ${o} over ${n}.`:/^Shuffle Forward\b/i.test(t)?`Step ${o} forward, close ${n} beside ${o}, step ${o} forward.`:/^Shuffle Back\b/i.test(t)?`Step ${o} back, close ${n} beside ${o}, step ${o} back.`:/^Shuffle Turn\b/i.test(t)?`Turn ${i} stepping ${o}-${n}-${o}.`:/^Chasse\b/i.test(t)?`Step ${o} to ${o} side, close ${n} beside ${o}, step ${o} to ${o} side.`:/^Step Lock Step Forward\b/i.test(t)?`Step ${o} forward, lock ${n} behind ${o}, step ${o} forward.`:/^Step Lock Step Back\b/i.test(t)?`Step ${o} back, lock ${n} across ${o}, step ${o} back.`:/^Pivot Turn\b/i.test(t)?`Step ${o} forward, pivot ${i} taking weight onto ${n}.`:/^Monterey Turn\b/i.test(t)?`Point ${o} to ${o} side, turn ${i} closing ${o} beside ${n}, point ${n} to ${n} side, close ${n} beside ${o}.`:/^Botafogo\b/i.test(t)||/\bBota Fogo\b/i.test(t)?`Cross ${o} over ${n}, rock ${n} to ${n} side, recover onto ${o}.`:/^Travell?ing Botafogo\b/i.test(t)?`Cross ${o} over ${n}, step ${n} slightly to ${n} side, recover onto ${o} travelling forward.`:/^Criss Cross Botafogo\b/i.test(t)?`Cross ${o} over ${n}, rock ${n} to ${n} side, recover onto ${o} with the body travelling across.`:/^Contra Botafogo\b/i.test(t)?`Cross ${o} over ${n}, rock ${n} to ${n} side, recover onto ${o} in contra body position.`:/^Same Foot Botafogo\b/i.test(t)?`Cross ${o} over ${n}, rock ${n} to ${n} side, recover onto ${o}, ready to repeat from the same-foot family.`:/^Samba Whisk\b/i.test(t)?`Step ${o} to ${o} side, rock ${n} slightly behind ${o}, recover onto ${o}.`:/^Samba Walk Stationary\b/i.test(t)||/^Stationary Samba Walk\b/i.test(t)?`Step ${o} forward, rock ${n} back on ball, recover onto ${o}.`:/^Samba Walk Promenade\b/i.test(t)||/^Promenade Samba Walk\b/i.test(t)?`Step ${o} forward in promenade, rock ${n} back on ball, recover onto ${o}.`:/^Samba Walk Side\b/i.test(t)||/^Side Samba Walk\b/i.test(t)?`Step ${o} slightly forward on ${o} diagonal, rock ${n} back on ball, recover onto ${o}.`:/^Volta Travell?ing\b/i.test(t)||/^Travell?ing Volta\b/i.test(t)?`Cross ${o} over ${n}, step ${n} slightly to ${n} side on ball, repeat travelling ${i}.`:/^Volta Spot Continuous\b/i.test(t)||/^Continuous Solo Spot Volta\b/i.test(t)?`Turn ${i} in place with repeated crossed samba steps, starting ${o}.`:/^Volta Spot\b/i.test(t)||/^Solo Spot Volta\b/i.test(t)?`Turn ${i} in place using small crossed samba steps, starting ${o}.`:/^Volta Circular Solo\b/i.test(t)||/^Solo Circular Volta\b/i.test(t)?`Travel in a small circle turning ${i} with crossed volta steps, starting ${o}.`:/^Volta Circular\b/i.test(t)||/^Circular Volta\b/i.test(t)?`Travel in a circle turning ${i} with crossed volta steps, starting ${o}.`:/^Volta Shadow Circular\b/i.test(t)||/^Shadow Circular Volta\b/i.test(t)?`Travel in shadow position in a circle turning ${i} with crossed volta steps, starting ${o}.`:/^Volta Shadow Travell?ing\b/i.test(t)||/^Shadow Travell?ing Volta\b/i.test(t)?`Travel in shadow position turning ${i} with crossed volta steps, starting ${o}.`:/^Volta Dropped\b/i.test(t)||/^Dropped Volta\b/i.test(t)?`Execute dropped volta action turning ${i} with crossed samba steps, starting ${o}.`:/^Cruzados Walk\b/i.test(t)||/^Cruzado Walk\b/i.test(t)?`Walk ${o} forward slightly across the line of ${n}, keeping the samba bounce.`:/^Cruzados Lock Continuous\b/i.test(t)||/^Continuous Cruzados Lock\b/i.test(t)?`Step ${o} forward, lock ${n} behind ${o}, repeat continuously with samba bounce.`:/^Cruzados Lock\b/i.test(t)||/^Cruzado Lock\b/i.test(t)?`Step ${o} forward, lock ${n} behind ${o}, step ${o} forward with samba bounce.`:/^Promenade Runs Samba\b/i.test(t)?`Run ${o}-${n}-${o} through promenade to counter-promenade action.`:/^Carioca Runs Samba\b/i.test(t)?`Run quickly with carioca action, crossing and opening through the hips, starting ${o}.`:/^Argentine Crosses Samba\b/i.test(t)?`Cross and replace weight with compact samba action, starting ${o}.`:null},Xd=[{name:"Basic Waltz Forward Left",desc:"Step left forward, close right beside left, step left in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Basic Waltz Forward Right",desc:"Step right forward, close left beside right, step right in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Basic Waltz Back Left",desc:"Step left back, close right beside left, step left in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Basic Waltz Back Right",desc:"Step right back, close left beside right, step right in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Balance Waltz Forward Left",desc:"Step left forward, step right beside left, step left in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Balance Waltz Forward Right",desc:"Step right forward, step left beside right, step right in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Balance Waltz Back Left",desc:"Step left back, step right beside left, step left in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Balance Waltz Back Right",desc:"Step right back, step left beside right, step right in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Balance Waltz Side Left",desc:"Step left to left side, step right beside left, step left in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Balance Waltz Side Right",desc:"Step right to right side, step left beside right, step right in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Balance Waltz Cross Left",desc:"Cross left over right, step right to right side, step left in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Balance Waltz Cross Right",desc:"Cross right over left, step left to left side, step right in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Cross Twinkle Left",desc:"Cross left over right, step right to right side, step left in place.",foot:"L",counts:"1-2-3",weight:!0},{name:"Cross Twinkle Right",desc:"Cross right over left, step left to left side, step right in place.",foot:"R",counts:"1-2-3",weight:!0},{name:"Turning Twinkle Left",desc:"Cross left over right, step right to right side turning slightly left, step left in place.",foot:"L",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Turning Twinkle Right",desc:"Cross right over left, step left to left side turning slightly right, step right in place.",foot:"R",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Twinkle 1/4 Turn Left",desc:"Cross left over right, step right to right side, turn 1/4 left stepping left in place.",foot:"L",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Twinkle 1/4 Turn Right",desc:"Cross right over left, step left to left side, turn 1/4 right stepping right in place.",foot:"R",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Twinkle 1/2 Turn Left",desc:"Cross left over right, step right to right side, turn 1/2 left stepping left in place.",foot:"L",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Twinkle 1/2 Turn Right",desc:"Cross right over left, step left to left side, turn 1/2 right stepping right in place.",foot:"R",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Waltz Box Left",desc:"Step left to left side, close right beside left, step left forward. Step right to right side, close left beside right, step right back.",foot:"L",counts:"1-2-3 4-5-6",weight:!0},{name:"Waltz Box Right",desc:"Step right to right side, close left beside right, step right forward. Step left to left side, close right beside left, step left back.",foot:"R",counts:"1-2-3 4-5-6",weight:!0},{name:"Waltz Box Forward Left",desc:"Step left to left side, close right beside left, step left forward.",foot:"L",counts:"1-2-3",weight:!0},{name:"Waltz Box Forward Right",desc:"Step right to right side, close left beside right, step right forward.",foot:"R",counts:"1-2-3",weight:!0},{name:"Waltz Box Back Left",desc:"Step left to left side, close right beside left, step left back.",foot:"L",counts:"1-2-3",weight:!0},{name:"Waltz Box Back Right",desc:"Step right to right side, close left beside right, step right back.",foot:"R",counts:"1-2-3",weight:!0},{name:"Waltz Box Cross Left",desc:"Cross left over right, step right back, step left to left side.",foot:"L",counts:"1-2-3",weight:!0},{name:"Waltz Box Cross Right",desc:"Cross right over left, step left back, step right to right side.",foot:"R",counts:"1-2-3",weight:!0},{name:"Half Diamond Left",desc:"Cross left over right, step right to right side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to side, turn 1/8 left stepping right forward.",foot:"L",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Half Diamond Right",desc:"Cross right over left, step left to left side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to side, turn 1/8 right stepping left forward.",foot:"R",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Full Diamond Left",desc:"Dance two consecutive half-diamond patterns turning left to complete a full diamond.",foot:"L",counts:"1-2-3 4-5-6 7-8-9 10-11-12",weight:!0,needsTurn:!0},{name:"Full Diamond Right",desc:"Dance two consecutive half-diamond patterns turning right to complete a full diamond.",foot:"R",counts:"1-2-3 4-5-6 7-8-9 10-11-12",weight:!0,needsTurn:!0},{name:"Fallaway Diamond Left",desc:"Turn 1/8 left and cross left over right, step right to side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to side, turn 1/8 left stepping right forward.",foot:"L",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Fallaway Diamond Right",desc:"Turn 1/8 right and cross right over left, step left to side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to side, turn 1/8 right stepping left forward.",foot:"R",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Diamond Weave Left",desc:"Cross left over right, step right to side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to side, step right forward.",foot:"L",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Diamond Weave Right",desc:"Cross right over left, step left to side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to side, step left forward.",foot:"R",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Weave Waltz Left",desc:"Cross left over right, step right to right side, step left behind right. Step right to right side, step left behind right, recover to right.",foot:"L",counts:"1-2-3 4-5-6",weight:!0},{name:"Weave Waltz Right",desc:"Cross right over left, step left to left side, step right behind left. Step left to left side, step right behind left, recover to left.",foot:"R",counts:"1-2-3 4-5-6",weight:!0},{name:"Forward Sweep Weave Left",desc:"Step left forward and sweep right from back to front over two counts, then cross right over left, step left to side, step right behind left.",foot:"L",counts:"1-2-3 4-5-6",weight:!0},{name:"Forward Sweep Weave Right",desc:"Step right forward and sweep left from back to front over two counts, then cross left over right, step right to side, step left behind right.",foot:"R",counts:"1-2-3 4-5-6",weight:!0},{name:"Hesitation Forward Left",desc:"Step left forward and hold or lightly drag right toward left for counts two and three.",foot:"L",counts:"1-2-3",weight:!0},{name:"Hesitation Forward Right",desc:"Step right forward and hold or lightly drag left toward right for counts two and three.",foot:"R",counts:"1-2-3",weight:!0},{name:"Hesitation Back Left",desc:"Step left back and hold or lightly drag right toward left for counts two and three.",foot:"L",counts:"1-2-3",weight:!0},{name:"Hesitation Back Right",desc:"Step right back and hold or lightly drag left toward right for counts two and three.",foot:"R",counts:"1-2-3",weight:!0},{name:"Hesitation Side Left",desc:"Step left to side and hold or lightly drag right toward left for counts two and three.",foot:"L",counts:"1-2-3",weight:!0},{name:"Hesitation Side Right",desc:"Step right to side and hold or lightly drag left toward right for counts two and three.",foot:"R",counts:"1-2-3",weight:!0},{name:"Cross Hesitation Left",desc:"Cross left over right and hold or lightly drag right toward left for counts two and three.",foot:"L",counts:"1-2-3",weight:!0},{name:"Cross Hesitation Right",desc:"Cross right over left and hold or lightly drag left toward right for counts two and three.",foot:"R",counts:"1-2-3",weight:!0},{name:"Step Drag Hold Left",desc:"Take a long step left and drag right toward left over counts two and three.",foot:"L",counts:"1-2-3",weight:!0},{name:"Step Drag Hold Right",desc:"Take a long step right and drag left toward right over counts two and three.",foot:"R",counts:"1-2-3",weight:!0},{name:"Step Point Hold Left",desc:"Step left, point right to side, then hold.",foot:"L",counts:"1-2-3",weight:!0},{name:"Step Point Hold Right",desc:"Step right, point left to side, then hold.",foot:"R",counts:"1-2-3",weight:!0},{name:"Canter Forward Left",desc:"Step left forward, close right beside left, close left beside right in smooth canter timing.",foot:"L",counts:"1-2-3",weight:!0},{name:"Canter Forward Right",desc:"Step right forward, close left beside right, close right beside left in smooth canter timing.",foot:"R",counts:"1-2-3",weight:!0},{name:"Canter Back Left",desc:"Step left back, close right beside left, close left beside right in smooth canter timing.",foot:"L",counts:"1-2-3",weight:!0},{name:"Canter Back Right",desc:"Step right back, close left beside right, close right beside left in smooth canter timing.",foot:"R",counts:"1-2-3",weight:!0},{name:"Turning Basic Waltz Left",desc:"Step left forward turning left, close right beside left, step left in place continuing the turn.",foot:"L",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Turning Basic Waltz Right",desc:"Step right forward turning right, close left beside right, step right in place continuing the turn.",foot:"R",counts:"1-2-3",weight:!0,needsTurn:!0},{name:"Outside Change Waltz Left",desc:"Step left forward, step right beside left, step left slightly forward changing alignment for the next waltz figure.",foot:"L",counts:"1-2-3",weight:!0},{name:"Outside Change Waltz Right",desc:"Step right forward, step left beside right, step right slightly forward changing alignment for the next waltz figure.",foot:"R",counts:"1-2-3",weight:!0},{name:"Inside Change Waltz Left",desc:"Step left back, step right beside left, step left slightly back changing alignment for the next waltz figure.",foot:"L",counts:"1-2-3",weight:!0},{name:"Inside Change Waltz Right",desc:"Step right back, step left beside right, step right slightly back changing alignment for the next waltz figure.",foot:"R",counts:"1-2-3",weight:!0},{name:"Natural Turn Waltz Left",desc:"Dance a natural-turning waltz figure beginning with the left foot.",foot:"L",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Natural Turn Waltz Right",desc:"Dance a natural-turning waltz figure beginning with the right foot.",foot:"R",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Reverse Turn Waltz Left",desc:"Dance a reverse-turning waltz figure beginning with the left foot.",foot:"L",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0},{name:"Reverse Turn Waltz Right",desc:"Dance a reverse-turning waltz figure beginning with the right foot.",foot:"R",counts:"1-2-3 4-5-6",weight:!0,needsTurn:!0}],Zd=[{name:"Behind Side Cross Left",desc:"Step left behind right, step right to right side, cross left over right.",foot:"L",counts:"1&2",weight:!0},{name:"Behind Side Cross Right",desc:"Step right behind left, step left to left side, cross right over left.",foot:"R",counts:"1&2",weight:!0},{name:"Syncopated Behind Side Cross Left",desc:"Quickly step left behind right, step right to right side, cross left over right.",foot:"L",counts:"1&2",weight:!0},{name:"Syncopated Behind Side Cross Right",desc:"Quickly step right behind left, step left to left side, cross right over left.",foot:"R",counts:"1&2",weight:!0},{name:"Behind Side Cross Point Left",desc:"Step left behind right, step right to right side, cross left over right, point right to right side.",foot:"L",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Point Right",desc:"Step right behind left, step left to left side, cross right over left, point left to left side.",foot:"R",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Touch Left",desc:"Step left behind right, step right to right side, cross left over right, touch right beside left.",foot:"L",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Touch Right",desc:"Step right behind left, step left to left side, cross right over left, touch left beside right.",foot:"R",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Hold Left",desc:"Step left behind right, step right to right side, cross left over right, hold.",foot:"L",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Hold Right",desc:"Step right behind left, step left to left side, cross right over left, hold.",foot:"R",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Sweep Left",desc:"Step left behind right, step right to right side, cross left over right, sweep right from back to front.",foot:"L",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Sweep Right",desc:"Step right behind left, step left to left side, cross right over left, sweep left from back to front.",foot:"R",counts:"1&2-3",weight:!0},{name:"Behind Side Cross 1/4 Turn Left",desc:"Step left behind right, step right to right side, turn 1/4 left crossing left over right.",foot:"L",counts:"1&2",weight:!0,needsTurn:!0},{name:"Behind Side Cross 1/4 Turn Right",desc:"Step right behind left, step left to left side, turn 1/4 right crossing right over left.",foot:"R",counts:"1&2",weight:!0,needsTurn:!0},{name:"Behind Side Cross Rock Left",desc:"Step left behind right, step right to right side, cross rock left over right, recover onto right.",foot:"L",counts:"1&2-3",weight:!0},{name:"Behind Side Cross Rock Right",desc:"Step right behind left, step left to left side, cross rock right over left, recover onto left.",foot:"R",counts:"1&2-3",weight:!0}],qd=[{name:"Toe Turn 1/4 Left",desc:"Touch right toe slightly back, turn 1/4 left on the ball of the supporting foot, then drop weight onto left.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Turn 1/4 Right",desc:"Touch left toe slightly back, turn 1/4 right on the ball of the supporting foot, then drop weight onto right.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Turn 1/2 Left",desc:"Touch right toe slightly back, turn 1/2 left on the ball of the supporting foot, then drop weight onto left.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Turn 1/2 Right",desc:"Touch left toe slightly back, turn 1/2 right on the ball of the supporting foot, then drop weight onto right.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Turn 3/4 Left",desc:"Touch right toe slightly back, turn 3/4 left on the ball of the supporting foot, then drop weight onto left.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Turn 3/4 Right",desc:"Touch left toe slightly back, turn 3/4 right on the ball of the supporting foot, then drop weight onto right.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Turn Full Left",desc:"Touch right toe slightly back, turn a full turn left on the ball of the supporting foot, then drop weight onto left.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Turn Full Right",desc:"Touch left toe slightly back, turn a full turn right on the ball of the supporting foot, then drop weight onto right.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Strut 1/4 Turn Left",desc:"Touch right toe back, turn 1/4 left, then drop right heel to take weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Strut 1/4 Turn Right",desc:"Touch left toe back, turn 1/4 right, then drop left heel to take weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Strut 1/2 Turn Left",desc:"Touch right toe back, turn 1/2 left, then drop right heel to take weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Strut 1/2 Turn Right",desc:"Touch left toe back, turn 1/2 right, then drop left heel to take weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Strut 3/4 Turn Left",desc:"Touch right toe back, turn 3/4 left, then drop right heel to take weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Strut 3/4 Turn Right",desc:"Touch left toe back, turn 3/4 right, then drop left heel to take weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Cross Toe Strut 1/4 Turn Left",desc:"Touch right toe across left, turn 1/4 left, then drop right heel to take weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Cross Toe Strut 1/4 Turn Right",desc:"Touch left toe across right, turn 1/4 right, then drop left heel to take weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Cross Toe Strut 1/2 Turn Left",desc:"Touch right toe across left, turn 1/2 left, then drop right heel to take weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Cross Toe Strut 1/2 Turn Right",desc:"Touch left toe across right, turn 1/2 right, then drop left heel to take weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Side Toe Strut 1/4 Turn Left",desc:"Touch right toe to right side, turn 1/4 left, then drop right heel to take weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Side Toe Strut 1/4 Turn Right",desc:"Touch left toe to left side, turn 1/4 right, then drop left heel to take weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Side Toe Strut 1/2 Turn Left",desc:"Touch right toe to right side, turn 1/2 left, then drop right heel to take weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Side Toe Strut 1/2 Turn Right",desc:"Touch left toe to left side, turn 1/2 right, then drop left heel to take weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Pivot 1/4 Left",desc:"Step right forward on the toe, pivot 1/4 left onto left, then settle weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Pivot 1/4 Right",desc:"Step left forward on the toe, pivot 1/4 right onto right, then settle weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Pivot 1/2 Left",desc:"Step right forward on the toe, pivot 1/2 left onto left, then settle weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Pivot 1/2 Right",desc:"Step left forward on the toe, pivot 1/2 right onto right, then settle weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Pivot 3/4 Left",desc:"Step right forward on the toe, pivot 3/4 left onto left, then settle weight.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Pivot 3/4 Right",desc:"Step left forward on the toe, pivot 3/4 right onto right, then settle weight.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Swivel Turn 1/4 Left",desc:"Place weight on the right heel and left toe, swivel both toes left for a 1/4 turn, then return weight to the left foot.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Swivel Turn 1/4 Right",desc:"Place weight on the left heel and right toe, swivel both toes right for a 1/4 turn, then return weight to the right foot.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Swivel Turn 1/2 Left",desc:"Place weight on the right heel and left toe, swivel both toes left for a 1/2 turn, then return weight to the left foot.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Swivel Turn 1/2 Right",desc:"Place weight on the left heel and right toe, swivel both toes right for a 1/2 turn, then return weight to the right foot.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Toe Heel Toe Turn Left",desc:"Touch right toe beside left, turn 1/4 left as the right heel lowers, then finish with the right toe turned out.",foot:"R",counts:"1&2",weight:!0,needsTurn:!0},{name:"Toe Heel Toe Turn Right",desc:"Touch left toe beside right, turn 1/4 right as the left heel lowers, then finish with the left toe turned out.",foot:"L",counts:"1&2",weight:!0,needsTurn:!0},{name:"Back Toe Turn 1/2 Left",desc:"Touch right toe back, turn 1/2 left, then step onto left while the right toe stays pointed back before closing.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Back Toe Turn 1/2 Right",desc:"Touch left toe back, turn 1/2 right, then step onto right while the left toe stays pointed back before closing.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Point Toe Turn 1/4 Left",desc:"Point right toe to right side, turn 1/4 left, then bring the right foot in under the body.",foot:"L",counts:"1-2",weight:!0,needsTurn:!0},{name:"Point Toe Turn 1/4 Right",desc:"Point left toe to left side, turn 1/4 right, then bring the left foot in under the body.",foot:"R",counts:"1-2",weight:!0,needsTurn:!0},{name:"Monterey Toe Turn Left",desc:"Point left toe to left side, turn left on the supporting foot bringing left beside right, point right to right side, close right beside left.",foot:"L",counts:"1-2-3-4",weight:!0,needsTurn:!0},{name:"Monterey Toe Turn Right",desc:"Point right toe to right side, turn right on the supporting foot bringing right beside left, point left to left side, close left beside right.",foot:"R",counts:"1-2-3-4",weight:!0,needsTurn:!0}],eg=e=>e.map(t=>{const r=Yd(t);return r?{...t,desc:r}:t}),tg={L:"Left",R:"Right"},rg=(e="")=>e&&String(e).replace(/\b(aggressively|fluidly|smoothly|entirely|firmly|cleanly|heavily|sharply|slightly|strongly|intentionally|forcefully|rigidly|tightly|quickly)\b/gi,"").replace(/\s+,/g,",").replace(/\s+\./g,".").replace(/\s{2,}/g," ").trim(),og=e=>{const t=String((e==null?void 0:e.name)||"");return e==null||e.foot,/^K-Step Left$/i.test(t)?"Step left diagonally forward, touch right beside left. Step right diagonally back, touch left beside right. Step left diagonally back, touch right beside left. Step right diagonally forward, touch left beside right.":/^K-Step Right$/i.test(t)?"Step right diagonally forward, touch left beside right. Step left diagonally back, touch right beside left. Step right diagonally back, touch left beside right. Step left diagonally forward, touch right beside left.":/^Diamond Turn Left$/i.test(t)?"Cross left over right, step right to right side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to left side, step right forward.":/^Diamond Turn Right$/i.test(t)?"Cross right over left, step left to left side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to right side, step left forward.":/^Samba Natural Basic$/i.test(t)?"Step left forward, rock right slightly back on ball, recover onto left. Step right back, rock left slightly forward on ball, recover onto right.":/^Samba Reverse Basic$/i.test(t)?"Step left back, rock right slightly forward on ball, recover onto left. Step right forward, rock left slightly back on ball, recover onto right.":/^Samba Progressive Basic$/i.test(t)?"Step left forward, rock right slightly back on ball, recover onto left. Step right forward, rock left slightly back on ball, recover onto right, travelling forward.":/^Samba Side Basic Left$/i.test(t)?"Step left to left side, recover onto right, close left beside right.":/^Samba Side Basic Right$/i.test(t)?"Step right to right side, recover onto left, close right beside left.":/^Samba Outside Basic Left$/i.test(t)?"Cross left slightly over right, rock right to right side, recover onto left.":/^Samba Outside Basic Right$/i.test(t)?"Cross right slightly over left, rock left to left side, recover onto right.":/^Samba Whisk Left$/i.test(t)?"Step left to left side, rock right slightly behind left on ball, recover onto left.":/^Samba Whisk Right$/i.test(t)?"Step right to right side, rock left slightly behind right on ball, recover onto right.":/^Samba Walk Stationary Left$/i.test(t)?"Step left forward, rock right slightly back on ball, recover onto left.":/^Samba Walk Stationary Right$/i.test(t)?"Step right forward, rock left slightly back on ball, recover onto right.":/^Samba Walk Promenade Left$/i.test(t)?"Step left forward in promenade, rock right slightly back on ball, recover onto left.":/^Samba Walk Promenade Right$/i.test(t)?"Step right forward in promenade, rock left slightly back on ball, recover onto right.":/^Samba Walk Side Left$/i.test(t)?"Step left slightly forward on left diagonal, rock right slightly back on ball, recover onto left.":/^Samba Walk Side Right$/i.test(t)?"Step right slightly forward on right diagonal, rock left slightly back on ball, recover onto right.":/^Samba Chasse Left$/i.test(t)?"Step left to left side, close right beside left, step left to left side.":/^Samba Chasse Right$/i.test(t)?"Step right to right side, close left beside right, step right to right side.":/^Travell?ing Botafogo Forward Left$/i.test(t)?"Cross left over right, step right slightly forward on right diagonal, recover onto left.":/^Travell?ing Botafogo Forward Right$/i.test(t)?"Cross right over left, step left slightly forward on left diagonal, recover onto right.":/^Travell?ing Botafogo Back Left$/i.test(t)?"Cross left over right, step right slightly back on right diagonal, recover onto left.":/^Travell?ing Botafogo Back Right$/i.test(t)?"Cross right over left, step left slightly back on left diagonal, recover onto right.":/^Travell?ing Botafogo to Promenade Left$/i.test(t)?"Cross left over right, step right slightly forward on right diagonal, recover onto left opening to promenade.":/^Travell?ing Botafogo to Promenade Right$/i.test(t)?"Cross right over left, step left slightly forward on left diagonal, recover onto right opening to promenade.":/^Promenade to Counter Promenade Botafogos Left$/i.test(t)?"Cross left over right, step right to right side, recover onto left. Cross right over left, step left to left side, recover onto right, changing shape from promenade to counter-promenade.":/^Promenade to Counter Promenade Botafogos Right$/i.test(t)?"Cross right over left, step left to left side, recover onto right. Cross left over right, step right to right side, recover onto left, changing shape from promenade to counter-promenade.":/^Contra Botafogo Left$/i.test(t)?"Cross left over right, step right to right side, recover onto left.":/^Contra Botafogo Right$/i.test(t)?"Cross right over left, step left to left side, recover onto right.":/^Criss Cross Botafogo Left$/i.test(t)?"Cross left over right, step right to right side, recover onto left travelling across.":/^Criss Cross Botafogo Right$/i.test(t)?"Cross right over left, step left to left side, recover onto right travelling across.":/^Same Foot Botafogo Left$/i.test(t)?"Cross left over right, step right to right side, recover onto left, ready to lead the next botafogo from the left side again.":/^Same Foot Botafogo Right$/i.test(t)?"Cross right over left, step left to left side, recover onto right, ready to lead the next botafogo from the right side again.":/^Volta Travelling Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right, continue travelling left.":/^Volta Travelling Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left, continue travelling right.":/^Volta Criss Cross Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right travelling across the floor.":/^Volta Criss Cross Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left travelling across the floor.":/^Volta Spot Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right while turning left in place.":/^Volta Spot Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left while turning right in place.":/^Volta Spot Continuous Left$/i.test(t)?"Repeat left spot volta actions: cross left over right, step right slightly to right side on ball, cross left over right while continuing to turn left.":/^Volta Spot Continuous Right$/i.test(t)?"Repeat right spot volta actions: cross right over left, step left slightly to left side on ball, cross right over left while continuing to turn right.":/^Volta Circular Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right while travelling in a small circle left.":/^Volta Circular Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left while travelling in a small circle right.":/^Volta Circular Solo Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right while circling left on your own.":/^Volta Circular Solo Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left while circling right on your own.":/^Volta Shadow Circular Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right while circling left in shadow position.":/^Volta Shadow Circular Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left while circling right in shadow position.":/^Volta Shadow Travell?ing Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right while travelling left in shadow position.":/^Volta Shadow Travell?ing Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left while travelling right in shadow position.":/^Volta Dropped Left$/i.test(t)?"Cross left over right, step right slightly to right side on ball, cross left over right with a lowered action.":/^Volta Dropped Right$/i.test(t)?"Cross right over left, step left slightly to left side on ball, cross right over left with a lowered action.":/^Cruzados Walk Left$/i.test(t)?"Step left forward and slightly across right, step right forward and slightly across left.":/^Cruzados Walk Right$/i.test(t)?"Step right forward and slightly across left, step left forward and slightly across right.":/^Cruzados Lock Left$/i.test(t)?"Step left forward and slightly across right, lock right behind left, step left forward and slightly across right.":/^Cruzados Lock Right$/i.test(t)?"Step right forward and slightly across left, lock left behind right, step right forward and slightly across left.":/^Cruzados Lock Continuous Left$/i.test(t)?"Repeat left cruzados locks travelling forward: step left forward and slightly across right, lock right behind left, step left forward.":/^Cruzados Lock Continuous Right$/i.test(t)?"Repeat right cruzados locks travelling forward: step right forward and slightly across left, lock left behind right, step right forward.":/^Samba Lock Left Side$/i.test(t)?"Step left forward on left diagonal, lock right behind left, step left forward.":/^Samba Lock Right Side$/i.test(t)?"Step right forward on right diagonal, lock left behind right, step right forward.":/^Natural Roll Samba Left$/i.test(t)?"Turn left stepping left forward, continue the turn stepping right to right side, close left beside right, then repeat for the second half of the roll.":/^Natural Roll Samba Right$/i.test(t)?"Turn right stepping right forward, continue the turn stepping left to left side, close right beside left, then repeat for the second half of the roll.":/^Reverse Roll Samba Left$/i.test(t)?"Turn left stepping left to left side, continue the turn stepping right back, close left beside right, then repeat for the second half of the reverse roll.":/^Reverse Roll Samba Right$/i.test(t)?"Turn right stepping right to right side, continue the turn stepping left back, close right beside left, then repeat for the second half of the reverse roll.":/^Close Rocks Samba Left$/i.test(t)?"Rock left slightly across or beside right, recover onto right, rock left again, recover onto right.":/^Close Rocks Samba Right$/i.test(t)?"Rock right slightly across or beside left, recover onto left, rock right again, recover onto left.":/^Open Rocks Samba Left$/i.test(t)?"Rock left away from right, recover onto right, rock left away again, recover onto right.":/^Open Rocks Samba Right$/i.test(t)?"Rock right away from left, recover onto left, rock right away again, recover onto left.":/^Backward Rocks Samba Left$/i.test(t)?"Rock left back, recover onto right, rock left back again, recover onto right.":/^Backward Rocks Samba Right$/i.test(t)?"Rock right back, recover onto left, rock right back again, recover onto left.":/^Maypole Samba Left$/i.test(t)?"Step left forward, step right across or around, step left to side, continue travelling around the partner line.":/^Maypole Samba Right$/i.test(t)?"Step right forward, step left across or around, step right to side, continue travelling around the partner line.":/^Corta Jaca Left$/i.test(t)?"Cross left over right, step right to right side, replace onto left.":/^Corta Jaca Right$/i.test(t)?"Cross right over left, step left to left side, replace onto right.":/^Corta Jaca Same Position Left$/i.test(t)?"Cross left over right, step right to right side, replace onto left without changing position.":/^Corta Jaca Same Position Right$/i.test(t)?"Cross right over left, step left to left side, replace onto right without changing position.":/^Plait Samba Left$/i.test(t)?"Step left forward and across, step right to right side, step left forward and across, continuing the weave.":/^Plait Samba Right$/i.test(t)?"Step right forward and across, step left to left side, step right forward and across, continuing the weave.":/^Rolling Off The Arm Left$/i.test(t)?"Step left forward, turn left stepping right to side or back, step left forward to travel away.":/^Rolling Off The Arm Right$/i.test(t)?"Step right forward, turn right stepping left to side or back, step right forward to travel away.":/^Promenade Runs Samba Left$/i.test(t)?"Run left-right-left through promenade, then continue into counter-promenade as needed.":/^Promenade Runs Samba Right$/i.test(t)?"Run right-left-right through promenade, then continue into counter-promenade as needed.":/^Carioca Runs Samba Left$/i.test(t)?"Run left-right-left-right with the feet crossing and uncrossing in samba timing.":/^Carioca Runs Samba Right$/i.test(t)?"Run right-left-right-left with the feet crossing and uncrossing in samba timing.":/^Argentine Crosses Samba Left$/i.test(t)?"Cross left over right, step right to right side, cross left over right again.":/^Argentine Crosses Samba Right$/i.test(t)?"Cross right over left, step left to left side, cross right over left again.":/^Samba Rhythm Bounce$/i.test(t)?"Keep both feet under the body and alternate knee pressure to create samba bounce without travelling.":/^Samba Drag Left$/i.test(t)?"Step left to left side or forward, then drag right toward left.":/^Samba Drag Right$/i.test(t)?"Step right to right side or forward, then drag left toward right.":/^Samba Foot Change Method 1$/i.test(t)?"Step one foot lightly on ball, replace onto the other foot, then step again to change the lead foot.":/^Samba Foot Change Method 2$/i.test(t)?"Take a small ball step, replace weight, then close or collect the free foot to change the lead foot.":/^Samba Foot Change Method 3$/i.test(t)?"Use three small weight changes under the body so the opposite foot becomes free to lead.":/^Samba Underarm Turn Left$/i.test(t)?"Step left forward, turn left under the arm stepping right to side or back, step left forward to finish.":/^Samba Underarm Turn Right$/i.test(t)?"Step right forward, turn right under the arm stepping left to side or back, step right forward to finish.":/^Samba Reverse Turn Left$/i.test(t)?"Turn left stepping left to side, step right back continuing the turn, close left beside right.":/^Samba Reverse Turn Right$/i.test(t)?"Turn right stepping right to side, step left back continuing the turn, close right beside left.":/^Balance Waltz Forward Left$/i.test(t)?"Step left forward, close right beside left, step left in place.":/^Balance Waltz Forward Right$/i.test(t)?"Step right forward, close left beside right, step right in place.":/^Balance Waltz Back Left$/i.test(t)?"Step left back, close right beside left, step left in place.":/^Balance Waltz Back Right$/i.test(t)?"Step right back, close left beside right, step right in place.":/^Balance Waltz Side Left$/i.test(t)?"Step left to left side, close right beside left, step left in place.":/^Balance Waltz Side Right$/i.test(t)?"Step right to right side, close left beside right, step right in place.":/^Balance Waltz Cross Left$/i.test(t)?"Cross left over right, close right beside left, step left in place.":/^Balance Waltz Cross Right$/i.test(t)?"Cross right over left, close left beside right, step right in place.":/^Turning Twinkle Left$/i.test(t)?"Cross left over right, step right to right side turning left, step left in place.":/^Turning Twinkle Right$/i.test(t)?"Cross right over left, step left to left side turning right, step right in place.":/^Twinkle 1\/4 Turn Left$/i.test(t)?"Cross left over right, turn 1/4 left stepping right back or to side, step left in place.":/^Twinkle 1\/4 Turn Right$/i.test(t)?"Cross right over left, turn 1/4 right stepping left back or to side, step right in place.":/^Twinkle 1\/2 Turn Left$/i.test(t)?"Cross left over right, turn 1/2 left stepping right back or to side, step left in place.":/^Twinkle 1\/2 Turn Right$/i.test(t)?"Cross right over left, turn 1/2 right stepping left back or to side, step right in place.":/^Waltz Box Left$/i.test(t)?"Step left forward, close right beside left, step left in place. Step right back, close left beside right, step right in place.":/^Waltz Box Right$/i.test(t)?"Step right forward, close left beside right, step right in place. Step left back, close right beside left, step left in place.":/^Half Diamond Left$/i.test(t)?"Cross left over right, step right to right side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to left side, step right forward.":/^Half Diamond Right$/i.test(t)?"Cross right over left, step left to left side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to right side, step left forward.":/^Full Diamond Left$/i.test(t)?"Dance two half-diamond patterns: cross left over right, step right to side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to side, step right forward, then repeat to complete the full diamond.":/^Full Diamond Right$/i.test(t)?"Dance two half-diamond patterns: cross right over left, step left to side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to side, step left forward, then repeat to complete the full diamond.":/^Fallaway Diamond Left$/i.test(t)?"Turn 1/8 left and cross left over right, step right to right side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to left side, turn 1/8 left stepping right forward.":/^Fallaway Diamond Right$/i.test(t)?"Turn 1/8 right and cross right over left, step left to left side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to right side, turn 1/8 right stepping left forward.":/^Diamond Weave Left$/i.test(t)?"Cross left over right, step right to right side, turn 1/8 left stepping left back. Step right back, turn 1/8 left stepping left to left side, step right forward.":/^Diamond Weave Right$/i.test(t)?"Cross right over left, step left to left side, turn 1/8 right stepping right back. Step left back, turn 1/8 right stepping right to right side, step left forward.":/^Weave Waltz Left$/i.test(t)?"Cross left over right, step right to right side, step left behind right. Step right to right side, step left behind right, recover onto right.":/^Weave Waltz Right$/i.test(t)?"Cross right over left, step left to left side, step right behind left. Step left to left side, step right behind left, recover onto left.":/^Forward Sweep Weave Left$/i.test(t)?"Step left forward and sweep right from back to front over counts two and three, then cross right over left, step left to left side, step right behind left.":/^Forward Sweep Weave Right$/i.test(t)?"Step right forward and sweep left from back to front over counts two and three, then cross left over right, step right to right side, step left behind right.":/^Hesitation Forward Left$/i.test(t)?"Step left forward, hold for counts two and three or drag right toward left.":/^Hesitation Forward Right$/i.test(t)?"Step right forward, hold for counts two and three or drag left toward right.":/^Hesitation Back Left$/i.test(t)?"Step left back, hold for counts two and three or drag right toward left.":/^Hesitation Back Right$/i.test(t)?"Step right back, hold for counts two and three or drag left toward right.":/^Hesitation Side Left$/i.test(t)?"Step left to left side, hold for counts two and three or drag right toward left.":/^Hesitation Side Right$/i.test(t)?"Step right to right side, hold for counts two and three or drag left toward right.":/^Cross Hesitation Left$/i.test(t)?"Cross left over right, hold for counts two and three or drag right toward left.":/^Cross Hesitation Right$/i.test(t)?"Cross right over left, hold for counts two and three or drag left toward right.":/^Step Drag Hold Left$/i.test(t)?"Step left to left side or forward, drag right toward left, hold.":/^Step Drag Hold Right$/i.test(t)?"Step right to right side or forward, drag left toward right, hold.":/^Step Point Hold Left$/i.test(t)?"Step left in place, point right to right side, hold.":/^Step Point Hold Right$/i.test(t)?"Step right in place, point left to left side, hold.":/^Canter Forward Left$/i.test(t)?"Step left forward, close right beside left, close left beside right.":/^Canter Forward Right$/i.test(t)?"Step right forward, close left beside right, close right beside left.":/^Canter Back Left$/i.test(t)?"Step left back, close right beside left, close left beside right.":/^Canter Back Right$/i.test(t)?"Step right back, close left beside right, close right beside left.":/^Turning Basic Waltz Left$/i.test(t)?"Step left forward turning left, close right beside left, step left in place.":/^Turning Basic Waltz Right$/i.test(t)?"Step right forward turning right, close left beside right, step right in place.":/^Outside Change Waltz Left$/i.test(t)?"Step left forward, step right beside left, step left slightly forward.":/^Outside Change Waltz Right$/i.test(t)?"Step right forward, step left beside right, step right slightly forward.":/^Inside Change Waltz Left$/i.test(t)?"Step left back, step right beside left, step left slightly back.":/^Inside Change Waltz Right$/i.test(t)?"Step right back, step left beside right, step right slightly back.":/^Natural Turn Waltz Left$/i.test(t)?"Turn left stepping left forward, step right to right side continuing the turn, close left beside right. Continue the second half with right back, left to side, close right beside left.":/^Natural Turn Waltz Right$/i.test(t)?"Turn right stepping right forward, step left to left side continuing the turn, close right beside left. Continue the second half with left back, right to side, close left beside right.":/^Reverse Turn Waltz Left$/i.test(t)?"Turn left stepping left to left side, step right back continuing the turn, close left beside right. Continue the second half with right forward, left to side, close right beside left.":/^Reverse Turn Waltz Right$/i.test(t)?"Turn right stepping right to right side, step left back continuing the turn, close right beside left. Continue the second half with left forward, right to side, close left beside right.":/^Boogie Left$/i.test(t)?"Keep weight on right foot and lift or roll the left hip and knee.":/^Boogie Right$/i.test(t)?"Keep weight on left foot and lift or roll the right hip and knee.":/^Boogie Roll Left$/i.test(t)?"Keep weight on right foot and roll the left hip in a circle.":/^Boogie Roll Right$/i.test(t)?"Keep weight on left foot and roll the right hip in a circle.":/^Boogie Walk Left$/i.test(t)?"Step left forward with a lifted left hip action.":/^Boogie Walk Right$/i.test(t)?"Step right forward with a lifted right hip action.":/^Break Step Left$/i.test(t)?"Step left in place or slightly forward to stop the previous movement.":/^Break Step Right$/i.test(t)?"Step right in place or slightly forward to stop the previous movement.":/^Cuban Motion Left$/i.test(t)?"Step onto the left foot and settle the left hip.":/^Cuban Motion Right$/i.test(t)?"Step onto the right foot and settle the right hip.":/^Jumping Jacks$/i.test(t)?"Jump and land with both feet apart, then jump and land with both feet together.":/^Skip Left$/i.test(t)?"Step left forward and hop lightly, then let right follow.":/^Skip Right$/i.test(t)?"Step right forward and hop lightly, then let left follow.":/^Spin Left$/i.test(t)?"Turn left on the supporting foot with the other foot collected.":/^Spin Right$/i.test(t)?"Turn right on the supporting foot with the other foot collected.":/^Stroll Left$/i.test(t)?"Step left forward, step right forward.":/^Stroll Right$/i.test(t)?"Step right forward, step left forward.":/^Willies$/i.test(t)?"Travel forward on the balls of both feet with toes turned inward and heels apart.":/^Pigeon Toed$/i.test(t)?"With both feet on the floor, bring toes toward each other, then bring heels toward each other to travel sideways.":/^Body Roll$/i.test(t)?"Keep both feet in place and roll the body up or down.":/^Freeze$/i.test(t)?"Keep both feet in place and hold for the count shown.":/^Shimmy$/i.test(t)?"Keep both feet under the body and shake the shoulders.":/^Turn In$/i.test(t)?"With both feet on the floor, turn the toes or knees inward.":/^Turn Out$/i.test(t)?"With both feet on the floor, turn the toes or knees outward.":null},ng=e=>e.map(t=>{const r=og(t);return r?{...t,desc:r}:{...t,desc:rg(t.desc||"")}}),Fa=(e="")=>e&&e.replace(/\b(left|right|l|r)\b/gi,t=>t==="left"?"right":t==="Left"?"Right":t==="LEFT"?"RIGHT":t==="right"?"left":t==="Right"?"Left":t==="RIGHT"?"LEFT":t==="l"?"r":t==="L"?"R":t==="r"?"l":t==="R"?"L":t),Et=(e="")=>String(e||"").replace(/\s+/g," ").trim(),ec=(e="")=>Et(String(e||"").replace(/\b(Left|Right)\b/gi,"")),ig=e=>{const t=[...e],r=new Set(e.map(o=>Et(o.name).toLowerCase()));return e.forEach(o=>{if(!(o.foot==="L"||o.foot==="R")||!/\b(Left|Right)\b/i.test(o.name))return;const n=Et(Fa(o.name));!n||r.has(n.toLowerCase())||(t.push({...o,name:n,desc:Fa(o.desc||""),foot:o.foot==="L"?"R":"L",autoGenerated:!0}),r.add(n.toLowerCase()))}),t},lg=(e="")=>{const t=new Set,r=Et(e);if(!r)return[];const o=n=>{const i=Et(n);i&&i.toLowerCase()!==r.toLowerCase()&&t.add(i)};return/^Grapevine\b/i.test(r)&&o(r.replace(/^Grapevine/i,"Vine")),/^Rolling Vine\b/i.test(r)&&o(r.replace(/^Rolling Vine/i,"Rolling Full Turn")),/^Nightclub Two Step\b/i.test(r)&&(o(r.replace(/^Nightclub Two Step/i,"Nightclub Basic")),o(r.replace(/^Nightclub Two Step/i,"Night Club Basic"))),/^Shuffle Turn\b/i.test(r)&&(o(r.replace(/^Shuffle Turn/i,"Turning Shuffle")),o(r.replace(/^Shuffle Turn/i,"Chasse Turn"))),/^Shuffle\b/i.test(r)&&o(r.replace(/^Shuffle/i,"Chasse")),/^Chasse\b/i.test(r)&&o(r.replace(/^Chasse/i,"Shuffle")),/^Step Lock Step\b/i.test(r)&&(o(r.replace(/^Step Lock Step/i,"Lock Step")),o(r.replace(/^Step Lock Step/i,"Step-Lock-Step"))),/^Scissor Step\b/i.test(r)&&o(r.replace(/^Scissor Step/i,"Scissors")),/^Jazz Box\b/i.test(r)&&o(r.replace(/^Jazz Box/i,"Jazz Square")),/^Rock Forward\b/i.test(r)&&o(r.replace(/^Rock Forward/i,"Forward Rock")),/^Rock Back\b/i.test(r)&&o(r.replace(/^Rock Back/i,"Back Rock")),/^Rock Side\b/i.test(r)&&o(r.replace(/^Rock Side/i,"Side Rock")),/^Cross Rock\b/i.test(r)&&o(r.replace(/^Cross Rock/i,"Rock Cross")),/^Mambo Forward\b/i.test(r)&&o(r.replace(/^Mambo Forward/i,"Forward Mambo")),/^Mambo Back\b/i.test(r)&&o(r.replace(/^Mambo Back/i,"Back Mambo")),/^Mambo Side\b/i.test(r)&&o(r.replace(/^Mambo Side/i,"Side Mambo")),/^Coaster Step Back\b/i.test(r)&&o(r.replace(/^Coaster Step Back/i,"Coaster Step")),/^Coaster Step Forward\b/i.test(r)&&o(r.replace(/^Coaster Step Forward/i,"Forward Coaster")),/^Brush Forward\b/i.test(r)&&o(r.replace(/^Brush Forward/i,"Forward Brush")),/^Brush Back\b/i.test(r)&&o(r.replace(/^Brush Back/i,"Back Brush")),/^Scuff Forward\b/i.test(r)&&o(r.replace(/^Scuff Forward/i,"Forward Scuff")),/^Sweep Forward\b/i.test(r)&&o(r.replace(/^Sweep Forward/i,"Forward Sweep")),/^Sweep Back\b/i.test(r)&&o(r.replace(/^Sweep Back/i,"Back Sweep")),/^Touch Beside\b/i.test(r)&&(o(r.replace(/^Touch Beside/i,"Touch Together")),o(r.replace(/^Touch Beside/i,"Together Touch"))),/^Touch Side\b/i.test(r)&&o(r.replace(/^Touch Side/i,"Side Touch")),/^Touch Forward\b/i.test(r)&&o(r.replace(/^Touch Forward/i,"Forward Touch")),/^Touch Back\b/i.test(r)&&o(r.replace(/^Touch Back/i,"Back Touch")),/^Tap Side\b/i.test(r)&&o(r.replace(/^Tap Side/i,"Side Tap")),/^Tap Forward\b/i.test(r)&&o(r.replace(/^Tap Forward/i,"Forward Tap")),/^Point Side\b/i.test(r)&&o(r.replace(/^Point Side/i,"Side Point")),/^Point Forward\b/i.test(r)&&o(r.replace(/^Point Forward/i,"Forward Point")),/^Point Back\b/i.test(r)&&o(r.replace(/^Point Back/i,"Back Point")),/^Heel Dig\b/i.test(r)&&(o(r.replace(/^Heel Dig/i,"Dig Heel")),o(r.replace(/^Heel Dig/i,"Dig"))),/^Heel\b/i.test(r)&&!/^Heel (Bounce|Splits?|Strut|Switch|Fan|Jack|Pivot|Twist|Grind)/i.test(r)&&o(r.replace(/^Heel/i,"Heel Touch")),/^Toe Back\b/i.test(r)&&(o(r.replace(/^Toe Back/i,"Back Toe")),o(r.replace(/^Toe Back/i,"Toe Touch Back"))),/^Toe Tap\b/i.test(r)&&o(r.replace(/^Toe Tap/i,"Tap Toe")),/^Nightclub Basic\b/i.test(r)&&o(r.replace(/^Nightclub Basic/i,"Nightclub Two Step")),/^Syncopated Weave\b/i.test(r)&&(o(r.replace(/^Syncopated Weave/i,"Side Behind Side Cross Side")),o(r.replace(/^Syncopated Weave/i,"Side, Behind Side Cross, Side")),o(r.replace(/^Syncopated Weave/i,"Weave Syncopated"))),/^Behind Side Cross\b/i.test(r)&&(o(r.replace(/^Behind Side Cross/i,"Behind-Side-Cross")),o(r.replace(/^Behind Side Cross/i,"Behind, Side, Cross")),o(r.replace(/^Behind Side Cross/i,"Behind Side Cross Step")),o(r.replace(/^Behind Side Cross/i,"Behind Side Cross Combination")),o(r.replace(/^Behind Side Cross/i,"Behind Side Cross Pattern")),o(r.replace(/^Behind Side Cross/i,"Behind Side Cross Sequence")),o(r.replace(/^Behind Side Cross/i,"Behind & Side & Cross")),o(r.replace(/^Behind Side Cross/i,"Syncopated Weave Finish"))),/^Syncopated Behind Side Cross\b/i.test(r)&&(o(r.replace(/^Syncopated Behind Side Cross/i,"Behind Side Cross")),o(r.replace(/^Syncopated Behind Side Cross/i,"Syncopated Behind-Side-Cross"))),/^Behind Side Cross Point\b/i.test(r)&&o(r.replace(/^Behind Side Cross Point/i,"Behind-Side-Cross Point")),/^Behind Side Cross Touch\b/i.test(r)&&o(r.replace(/^Behind Side Cross Touch/i,"Behind-Side-Cross Touch")),/^Behind Side Cross Hold\b/i.test(r)&&o(r.replace(/^Behind Side Cross Hold/i,"Behind-Side-Cross Hold")),/^Behind Side Cross Sweep\b/i.test(r)&&o(r.replace(/^Behind Side Cross Sweep/i,"Behind-Side-Cross Sweep")),/^Behind Side Cross 1\/4 Turn\b/i.test(r)&&(o(r.replace(/^Behind Side Cross 1\/4 Turn/i,"Quarter Turn Behind Side Cross")),o(r.replace(/^Behind Side Cross 1\/4 Turn/i,"Behind-Side-Cross 1/4 Turn"))),/^Behind Side Cross Rock\b/i.test(r)&&o(r.replace(/^Behind Side Cross Rock/i,"Behind-Side-Cross Rock")),/^Toe Turn 1\/4/i.test(r)&&(o(r.replace(/^Toe Turn 1\/4/i,"Quarter Toe Turn")),o(r.replace(/^Toe Turn 1\/4/i,"Toe Turn Quarter")),o(r.replace(/^Toe Turn 1\/4/i,"Touch Toe 1/4 Turn"))),/^Toe Turn 1\/2/i.test(r)&&(o(r.replace(/^Toe Turn 1\/2/i,"Half Toe Turn")),o(r.replace(/^Toe Turn 1\/2/i,"Toe Turn Half")),o(r.replace(/^Toe Turn 1\/2/i,"Touch Toe 1/2 Turn"))),/^Toe Turn 3\/4/i.test(r)&&(o(r.replace(/^Toe Turn 3\/4/i,"Three Quarter Toe Turn")),o(r.replace(/^Toe Turn 3\/4/i,"Toe Turn Three Quarter")),o(r.replace(/^Toe Turn 3\/4/i,"Touch Toe 3/4 Turn"))),/^Toe Turn Full/i.test(r)&&(o(r.replace(/^Toe Turn Full/i,"Full Toe Turn")),o(r.replace(/^Toe Turn Full/i,"Toe Turn Full Turn"))),/^Toe Strut 1\/4 Turn/i.test(r)&&(o(r.replace(/^Toe Strut 1\/4 Turn/i,"Quarter Turn Toe Strut")),o(r.replace(/^Toe Strut 1\/4 Turn/i,"Toe Strut Quarter Turn"))),/^Toe Strut 1\/2 Turn/i.test(r)&&(o(r.replace(/^Toe Strut 1\/2 Turn/i,"Half Turn Toe Strut")),o(r.replace(/^Toe Strut 1\/2 Turn/i,"Toe Strut Half Turn"))),/^Toe Strut 3\/4 Turn/i.test(r)&&(o(r.replace(/^Toe Strut 3\/4 Turn/i,"Three Quarter Turn Toe Strut")),o(r.replace(/^Toe Strut 3\/4 Turn/i,"Toe Strut Three Quarter Turn"))),/^Cross Toe Strut 1\/4 Turn/i.test(r)&&o(r.replace(/^Cross Toe Strut 1\/4 Turn/i,"Quarter Turn Cross Toe Strut")),/^Cross Toe Strut 1\/2 Turn/i.test(r)&&o(r.replace(/^Cross Toe Strut 1\/2 Turn/i,"Half Turn Cross Toe Strut")),/^Side Toe Strut 1\/4 Turn/i.test(r)&&o(r.replace(/^Side Toe Strut 1\/4 Turn/i,"Quarter Turn Side Toe Strut")),/^Side Toe Strut 1\/2 Turn/i.test(r)&&o(r.replace(/^Side Toe Strut 1\/2 Turn/i,"Half Turn Side Toe Strut")),/^Toe Pivot 1\/4/i.test(r)&&(o(r.replace(/^Toe Pivot 1\/4/i,"Quarter Toe Pivot")),o(r.replace(/^Toe Pivot 1\/4/i,"Toe Pivot Quarter"))),/^Toe Pivot 1\/2/i.test(r)&&(o(r.replace(/^Toe Pivot 1\/2/i,"Half Toe Pivot")),o(r.replace(/^Toe Pivot 1\/2/i,"Toe Pivot Half"))),/^Toe Pivot 3\/4/i.test(r)&&(o(r.replace(/^Toe Pivot 3\/4/i,"Three Quarter Toe Pivot")),o(r.replace(/^Toe Pivot 3\/4/i,"Toe Pivot Three Quarter"))),/^Toe Swivel Turn 1\/4/i.test(r)&&(o(r.replace(/^Toe Swivel Turn 1\/4/i,"Quarter Toe Swivel Turn")),o(r.replace(/^Toe Swivel Turn 1\/4/i,"Swivel Toe 1/4 Turn"))),/^Toe Swivel Turn 1\/2/i.test(r)&&(o(r.replace(/^Toe Swivel Turn 1\/2/i,"Half Toe Swivel Turn")),o(r.replace(/^Toe Swivel Turn 1\/2/i,"Swivel Toe 1/2 Turn"))),/^Toe Heel Toe Turn/i.test(r)&&(o(r.replace(/^Toe Heel Toe Turn/i,"Toe-Heel-Toe Turn")),o(r.replace(/^Toe Heel Toe Turn/i,"Toe Heel Toe"))),/^Back Toe Turn 1\/2/i.test(r)&&(o(r.replace(/^Back Toe Turn 1\/2/i,"Toe Back 1/2 Turn")),o(r.replace(/^Back Toe Turn 1\/2/i,"Back Touch Toe Turn 1/2"))),/^Point Toe Turn 1\/4/i.test(r)&&(o(r.replace(/^Point Toe Turn 1\/4/i,"Point 1/4 Toe Turn")),o(r.replace(/^Point Toe Turn 1\/4/i,"Toe Point 1/4 Turn"))),/^Monterey Toe Turn/i.test(r)&&(o(r.replace(/^Monterey Toe Turn/i,"Monterey Turn")),o(r.replace(/^Monterey Toe Turn/i,"Point Turn Close"))),/^Restart Marker$/i.test(r)&&o("Restart"),/^Tag Marker$/i.test(r)&&o("Tag"),/^Bridge Marker$/i.test(r)&&o("Bridge"),/^Heel Bounce$/i.test(r)&&o("Heel Drops"),/^Heel Splits?$/i.test(r)&&o("Split Heels"),/^Toe Splits?$/i.test(r)&&o("Split Toes"),/^Pigeon Toed$/i.test(r)&&o("Pigeon Toe"),/^Samba Walk Stationary\b/i.test(r)&&o(r.replace(/^Samba Walk Stationary/i,"Stationary Samba Walk")),/^Samba Walk Promenade\b/i.test(r)&&o(r.replace(/^Samba Walk Promenade/i,"Promenade Samba Walk")),/^Samba Walk Side\b/i.test(r)&&o(r.replace(/^Samba Walk Side/i,"Side Samba Walk")),/^Samba Side Basic\b/i.test(r)&&o(r.replace(/^Samba Side Basic/i,"Side Basic Samba")),/^Samba Whisk\b/i.test(r)&&o(r.replace(/^Samba Whisk/i,"Whisk Samba")),/^Botafogo\b/i.test(r)&&(o(r.replace(/^Botafogo/i,"Bota Fogo")),o(r.replace(/^Botafogo/i,"Cross Samba"))),/^Travelling Botafogo\b/i.test(r)&&o(r.replace(/^Travelling Botafogo/i,"Traveling Botafogo")),/^Traveling Botafogo\b/i.test(r)&&o(r.replace(/^Traveling Botafogo/i,"Travelling Botafogo")),/^Criss Cross Botafogo\b/i.test(r)&&(o(r.replace(/^Criss Cross Botafogo/i,"Criss Cross Bota Fogo")),o(r.replace(/^Criss Cross Botafogo/i,"Shadow Botafogo"))),/^Contra Botafogo\b/i.test(r)&&o(r.replace(/^Contra Botafogo/i,"Contra Bota Fogo")),/^Same Foot Botafogo\b/i.test(r)&&o(r.replace(/^Same Foot Botafogo/i,"Same Foot Bota Fogo")),/^Volta Travelling\b/i.test(r)&&(o(r.replace(/^Volta Travelling/i,"Travelling Volta")),o(r.replace(/^Volta Travelling/i,"Traveling Volta"))),/^Volta Criss Cross\b/i.test(r)&&o(r.replace(/^Volta Criss Cross/i,"Criss Cross Volta")),/^Volta Spot Continuous\b/i.test(r)&&o(r.replace(/^Volta Spot Continuous/i,"Continuous Solo Spot Volta")),/^Volta Spot\b/i.test(r)&&o(r.replace(/^Volta Spot/i,"Solo Spot Volta")),/^Volta Circular Solo\b/i.test(r)&&o(r.replace(/^Volta Circular Solo/i,"Solo Circular Volta")),/^Volta Circular\b/i.test(r)&&o(r.replace(/^Volta Circular/i,"Circular Volta")),/^Volta Shadow Circular\b/i.test(r)&&o(r.replace(/^Volta Shadow Circular/i,"Shadow Circular Volta")),/^Volta Shadow Travelling\b/i.test(r)&&(o(r.replace(/^Volta Shadow Travelling/i,"Shadow Travelling Volta")),o(r.replace(/^Volta Shadow Travelling/i,"Shadow Traveling Volta"))),/^Volta Dropped\b/i.test(r)&&o(r.replace(/^Volta Dropped/i,"Dropped Volta")),/^Cruzados Walk\b/i.test(r)&&o(r.replace(/^Cruzados Walk/i,"Cruzado Walk")),/^Cruzados Lock Continuous\b/i.test(r)&&o(r.replace(/^Cruzados Lock Continuous/i,"Continuous Cruzados Lock")),/^Cruzados Lock\b/i.test(r)&&o(r.replace(/^Cruzados Lock/i,"Cruzado Lock")),/^Samba Lock Left Side\b/i.test(r)&&o(r.replace(/^Samba Lock Left Side/i,"Samba Locks Lady on Left Side")),/^Samba Lock Right Side\b/i.test(r)&&o(r.replace(/^Samba Lock Right Side/i,"Samba Locks Lady on Right Side")),/^Natural Roll Samba\b/i.test(r)&&o(r.replace(/^Natural Roll Samba/i,"Natural Roll")),/^Reverse Roll Samba\b/i.test(r)&&o(r.replace(/^Reverse Roll Samba/i,"Reverse Roll")),/^Close Rocks Samba\b/i.test(r)&&o(r.replace(/^Close Rocks Samba/i,"Closed Rocks")),/^Open Rocks Samba\b/i.test(r)&&o(r.replace(/^Open Rocks Samba/i,"Open Rocks")),/^Backward Rocks Samba\b/i.test(r)&&o(r.replace(/^Backward Rocks Samba/i,"Backward Rocks")),/^Maypole Samba\b/i.test(r)&&o(r.replace(/^Maypole Samba/i,"Maypole")),/^Plait Samba\b/i.test(r)&&o(r.replace(/^Plait Samba/i,"Plait")),/^Promenade Runs Samba\b/i.test(r)&&o(r.replace(/^Promenade Runs Samba/i,"Promenade to Counter Promenade Runs")),/^Carioca Runs Samba\b/i.test(r)&&o(r.replace(/^Carioca Runs Samba/i,"Carioca Runs")),/^Argentine Crosses Samba\b/i.test(r)&&o(r.replace(/^Argentine Crosses Samba/i,"Argentine Crosses")),/^Samba Rhythm Bounce$/i.test(r)&&o("Rhythm Bounce"),/^Samba Drag\b/i.test(r)&&o(r.replace(/^Samba Drag/i,"Drag")),/^Samba Foot Change Method\b/i.test(r)&&o(r.replace(/^Samba Foot Change Method/i,"Foot Change Method")),/^Basic Waltz Forward\b/i.test(r)&&(o(r.replace(/^Basic Waltz Forward/i,"Waltz Basic Forward")),o(r.replace(/^Basic Waltz Forward/i,"Forward Basic Waltz")),o(r.replace(/^Basic Waltz Forward/i,"Forward Waltz Basic"))),/^Basic Waltz Back\b/i.test(r)&&(o(r.replace(/^Basic Waltz Back/i,"Waltz Basic Back")),o(r.replace(/^Basic Waltz Back/i,"Back Basic Waltz")),o(r.replace(/^Basic Waltz Back/i,"Back Waltz Basic"))),/^Balance Waltz Forward\b/i.test(r)&&o(r.replace(/^Balance Waltz Forward/i,"Forward Balance Waltz")),/^Balance Waltz Back\b/i.test(r)&&o(r.replace(/^Balance Waltz Back/i,"Back Balance Waltz")),/^Balance Waltz Side\b/i.test(r)&&o(r.replace(/^Balance Waltz Side/i,"Side Balance Waltz")),/^Balance Waltz Cross\b/i.test(r)&&o(r.replace(/^Balance Waltz Cross/i,"Cross Balance Waltz")),/^Twinkle\b/i.test(r)&&!/^Cross Twinkle\b/i.test(r)&&o(r.replace(/^Twinkle/i,"Cross Twinkle")),/^Turning Twinkle\b/i.test(r)&&o(r.replace(/^Turning Twinkle/i,"Twinkle Turn")),/^Twinkle 1\/4 Turn\b/i.test(r)&&o(r.replace(/^Twinkle 1\/4 Turn/i,"Quarter Turn Twinkle")),/^Twinkle 1\/2 Turn\b/i.test(r)&&o(r.replace(/^Twinkle 1\/2 Turn/i,"Half Turn Twinkle")),/^Waltz Box\b/i.test(r)&&(o(r.replace(/^Waltz Box/i,"Box Waltz")),o(r.replace(/^Waltz Box/i,"Box Step Waltz"))),/^Half Diamond\b/i.test(r)&&(o(r.replace(/^Half Diamond/i,"Diamond Half")),o(r.replace(/^Half Diamond/i,"Half Diamond Waltz"))),/^Full Diamond\b/i.test(r)&&(o(r.replace(/^Full Diamond/i,"Diamond Full")),o(r.replace(/^Full Diamond/i,"Full Diamond Waltz"))),/^Fallaway Diamond\b/i.test(r)&&o(r.replace(/^Fallaway Diamond/i,"Fall Away Diamond")),/^Weave Waltz\b/i.test(r)&&o(r.replace(/^Weave Waltz/i,"Waltz Weave")),/^Hesitation Forward\b/i.test(r)&&(o(r.replace(/^Hesitation Forward/i,"Forward Hesitation")),o(r.replace(/^Hesitation Forward/i,"Hesitation Waltz Forward"))),/^Hesitation Back\b/i.test(r)&&(o(r.replace(/^Hesitation Back/i,"Back Hesitation")),o(r.replace(/^Hesitation Back/i,"Hesitation Waltz Back"))),/^Hesitation Side\b/i.test(r)&&(o(r.replace(/^Hesitation Side/i,"Side Hesitation")),o(r.replace(/^Hesitation Side/i,"Hesitation Waltz Side"))),/^Cross Hesitation\b/i.test(r)&&o(r.replace(/^Cross Hesitation/i,"Hesitation Cross")),/^Step Drag Hold\b/i.test(r)&&(o(r.replace(/^Step Drag Hold/i,"Drag Hold")),o(r.replace(/^Step Drag Hold/i,"Step Drag"))),/^Step Point Hold\b/i.test(r)&&(o(r.replace(/^Step Point Hold/i,"Point Hold")),o(r.replace(/^Step Point Hold/i,"Step Point"))),/^Canter Forward\b/i.test(r)&&o(r.replace(/^Canter Forward/i,"Forward Canter")),/^Canter Back\b/i.test(r)&&o(r.replace(/^Canter Back/i,"Back Canter")),/^Turning Basic Waltz\b/i.test(r)&&(o(r.replace(/^Turning Basic Waltz/i,"Turning Waltz Basic")),o(r.replace(/^Turning Basic Waltz/i,"Basic Waltz Turn"))),/^Outside Change Waltz\b/i.test(r)&&o(r.replace(/^Outside Change Waltz/i,"Waltz Outside Change")),/^Inside Change Waltz\b/i.test(r)&&o(r.replace(/^Inside Change Waltz/i,"Waltz Inside Change")),/^Natural Turn Waltz\b/i.test(r)&&(o(r.replace(/^Natural Turn Waltz/i,"Natural Waltz Turn")),o(r.replace(/^Natural Turn Waltz/i,"Waltz Natural Turn"))),/^Reverse Turn Waltz\b/i.test(r)&&(o(r.replace(/^Reverse Turn Waltz/i,"Reverse Waltz Turn")),o(r.replace(/^Reverse Turn Waltz/i,"Waltz Reverse Turn"))),[...t]},sg=(e="")=>{const t=new Set,r=Et(e);if(!r)return[];const o=n=>{const i=Et(n);i&&t.add(i)};return o(r),o(r.replace(/\s+/g,"-")),o(r.replace(/and/gi,"&")),o(r.replace(/&/g,"and")),o(`${r} Step`),o(`${r} Figure`),o(`${r} Pattern`),o(`${r} Sequence`),o(`${r} Variation`),o(`${r} Footwork`),o(`${r} Foot Placement`),o(`${r} Tutorial`),o(`${r} Explained`),o(`Line Dance ${r}`),o(`Linedance ${r}`),[...t]},ag={"Syncopated Weave Left":{foot:"L",desc:"Step left to left side, step right behind left, step left to left side, cross right over left, step left to left side."},"Syncopated Weave Right":{foot:"R",desc:"Step right to right side, step left behind right, step right to right side, cross left over right, step right to right side."}},ug=(e="")=>{const t=String(e||"").replace(/\s+/g," ").trim();if(!t)return null;const r=[/^(?:Big step|Step|Cross|Rock|Point|Touch|Tap|Kick|Walk|Slide|Drag|Sweep|Brush|Scuff|Stomp|Stamp|Hitch|Hook|Dig|Close|Pull|Thrust|Push|Shift)\s+(?:the\s+)?(left|right)\b/i,/^Turn\s+\d\/?\d?\s+(?:left|right)\s+stepping\s+(?:the\s+)?(left|right)\b/i,/^Step\s+forward\s+on\s+(?:the\s+)?(left|right)\b/i,/^Step\s+back\s+on\s+(?:the\s+)?(left|right)\b/i,/^Step\s+onto\s+(?:the\s+)?(left|right)\b/i];for(const o of r){const n=t.match(o);if(n)return n[1].toLowerCase()==="left"?"L":"R"}return null},fg=e=>{const t=ag[e.name];if(t)return{...e,...t};if(e.foot==="L"||e.foot==="R"){const r=ug(e.desc);if(r&&r!==e.foot)return{...e,foot:r}}return e},cg=e=>ig(e).map(t=>({...fg(t),groupKey:ec(t.name)})),hg=[/^Promenade to Counter Promenade Botafogos\b/i,/^Same Foot Botafogo\b/i,/^Volta Shadow\b/i,/^Volta Dropped\b/i,/^Cruzados\b/i,/^Natural Roll Samba\b/i,/^Reverse Roll Samba\b/i,/^Maypole Samba\b/i,/^Corta Jaca\b/i,/^Promenade Runs Samba\b/i,/^Carioca Runs Samba\b/i,/^Argentine Crosses Samba\b/i],dg=e=>!hg.some(t=>t.test(e.name||"")),gg=cg(ng(eg([...Jd,...Xd,...Zd,...qd].filter(dg)))),pg=e=>{const t=new Set,r=tg[e.foot],o=n=>{const i=Et(n);i&&t.add(i.toLowerCase())};return o(e.name),o(e.desc||""),sg(e.name).forEach(o),lg(e.name).forEach(o),r&&(o(`${e.name} ${r}`),o(`${r} ${e.name}`),o(`start ${r} ${e.name}`),o(`${e.name} lead ${r}`)),Array.from(t).join(" • ")},tc=1587322,Mn=e=>e&&e.replace(/\b(left|right|l|r|forward|back|behind|front|clockwise|counter-clockwise)\b/gi,t=>{const r=t[0]===t[0].toUpperCase(),o=t.toLowerCase();return o==="left"?r?"Right":"right":o==="right"?r?"Left":"left":o==="forward"?r?"Back":"back":o==="back"?r?"Forward":"forward":o==="behind"?r?"Front":"front":o==="front"?r?"Behind":"behind":o==="clockwise"?r?"Counter-clockwise":"counter-clockwise":o==="counter-clockwise"?r?"Clockwise":"clockwise":t==="l"?"r":t==="L"?"R":t==="r"?"l":t==="R"?"L":t}),rc=(e,t)=>{const r=W.useRef(null),o=W.useRef(!1),n=W.useRef({x:0,y:0});return{onTouchStart:a=>{o.current=!1;const d=a.touches?a.touches[0]:a;n.current={x:d.clientX,y:d.clientY},r.current=setTimeout(()=>{if(o.current=!0,e(d.clientX,d.clientY),typeof window<"u"&&window.navigator&&window.navigator.vibrate)try{window.navigator.vibrate(40)}catch{}},600)},onTouchMove:a=>{const d=a.touches?a.touches[0]:a;Math.hypot(d.clientX-n.current.x,d.clientY-n.current.y)>15&&r.current&&clearTimeout(r.current)},onTouchEnd:a=>{r.current&&clearTimeout(r.current),o.current?a.preventDefault():t&&t()},onContextMenu:a=>{a.preventDefault(),e(a.clientX,a.clientY)}}};function qe({icon:e,label:t,onClick:r,color:o="",disabled:n=!1}){const i=l=>{l.preventDefault(),l.stopPropagation(),n||r()};return u.jsxs("button",{type:"button",onPointerDown:l=>{l.preventDefault(),l.stopPropagation()},onClick:i,disabled:n,className:`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors touch-manipulation ${n?"opacity-30":"hover:bg-neutral-100 dark:hover:bg-neutral-700"} ${o}`,children:[u.jsx("span",{className:"shrink-0",children:hn.cloneElement(e,{size:16})}),t]})}function Yo({dark:e}){return u.jsx("div",{className:`h-px my-1 ${e?"bg-neutral-700":"bg-neutral-100"}`})}function Pi({active:e,onClick:t,label:r,icon:o}){return u.jsxs("button",{onClick:t,className:`px-2.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap ${e?"bg-white dark:bg-neutral-700 shadow-sm text-indigo-600":"opacity-50 hover:opacity-100"}`,children:[o," ",r]})}function zi({label:e,value:t,onChange:r,dark:o}){return u.jsxs("div",{className:"space-y-1",children:[u.jsx("label",{className:"text-[10px] font-black uppercase tracking-widest opacity-50 ml-1",children:e}),u.jsx("input",{value:t,onChange:n=>r(n.target.value),className:`w-full px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 ${o?"bg-neutral-800 border-neutral-700":"bg-neutral-100 border-neutral-200"} border font-bold`})]})}function Xo({label:e,value:t,options:r,onChange:o,dark:n}){return u.jsxs("div",{className:"space-y-1 w-full",children:[u.jsx("label",{className:"text-[10px] font-black uppercase tracking-widest opacity-50 ml-1",children:e}),u.jsx("select",{value:t,onChange:i=>o(i.target.value),className:`w-full px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer font-bold ${n?"bg-neutral-800 border-neutral-700":"bg-neutral-100 border-neutral-200"} border`,children:r.map(i=>{const l=typeof i=="string"?{value:i,label:i}:i;return u.jsx("option",{value:l.value,children:l.label},l.value||l.label)})})]})}function Da({step:e,onUpdate:t,onHold:r,onRemove:o,dark:n}){const[i,l]=W.useState(!1),[s,a]=W.useState(2),d=rc((p,g)=>r(p,g),null),m=p=>p.stopPropagation();if(e.type==="marker"){const p=e.markerType==="restart";return u.jsxs("div",{className:`flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 mb-2 ${p?"border-red-500/30 bg-red-500/5":"border-orange-500/30 bg-orange-500/5"}`,children:[u.jsxs("div",{className:"flex items-center gap-3 flex-1",children:[u.jsxs("span",{className:`font-black uppercase tracking-widest text-xs sm:text-sm ${p?"text-red-500":"text-orange-500"}`,children:[p?"Restart":"Tag"," Here on Wall:"]}),u.jsx("input",{value:e.wall||"",onChange:g=>t({wall:g.target.value}),placeholder:"#",className:`w-12 sm:w-16 p-1.5 sm:p-2 rounded-lg text-center font-bold outline-none focus:ring-2 ${n?"bg-neutral-900 text-white focus:ring-red-500 border border-red-500/50":"bg-white text-black focus:ring-red-500 border border-red-200"}`})]}),u.jsx("button",{onClick:o,className:"p-2 text-neutral-400 hover:text-red-500 transition-colors",title:"Remove Marker",children:u.jsx(ir,{size:18})})]})}return u.jsxs("div",{...d,className:`group grid grid-cols-1 sm:grid-cols-12 gap-3 items-start p-2 rounded-2xl transition-all relative overflow-x-hidden ${n?"hover:bg-neutral-800":"hover:bg-neutral-100"}`,children:[u.jsxs("div",{className:"col-span-1 sm:col-span-2 min-w-0",children:[u.jsx("div",{className:"sm:hidden text-[10px] font-black uppercase tracking-widest opacity-50 mb-1",children:"Count"}),u.jsx("input",{onTouchStart:m,onMouseDown:m,value:e.count,onChange:p=>t({count:p.target.value}),className:"w-full rounded-xl px-3 py-2 sm:px-0 sm:py-0 sm:rounded-none bg-neutral-100 dark:bg-neutral-900 sm:bg-transparent font-mono font-black text-center text-sm outline-none sm:bg-transparent",placeholder:"1"})]}),u.jsxs("div",{className:"col-span-1 sm:col-span-8 space-y-1 relative min-w-0",children:[u.jsx("input",{onTouchStart:m,onMouseDown:m,value:e.name,onChange:p=>t({name:p.target.value}),placeholder:"Move Name",className:"w-full bg-transparent font-bold outline-none text-sm min-w-0"}),u.jsx("input",{onTouchStart:m,onMouseDown:m,value:e.description,onChange:p=>{const g=p.target.value;t({description:g});const S=/\bturn\b/i.test(g),b=/\d\/\d|full|No turn/i.test(g);S&&!b?(a(2),l(!0)):l(!1)},placeholder:"Move details...",className:"w-full bg-transparent opacity-60 outline-none text-xs min-w-0"}),i&&u.jsxs("div",{className:`absolute top-full left-0 mt-2 z-50 p-3 rounded-xl shadow-2xl w-[220px] border flex flex-col gap-3 ${n?"bg-neutral-800 border-neutral-700":"bg-white border-neutral-200"}`,children:[u.jsx("div",{className:"text-center text-[10px] font-black opacity-60 uppercase tracking-widest",children:"Select Turn Amount"}),u.jsxs("div",{className:`flex items-center justify-between rounded-lg p-1 border ${n?"bg-neutral-900 border-neutral-700":"bg-neutral-100 border-neutral-200"}`,children:[u.jsx("button",{onMouseDown:p=>{p.preventDefault(),a(g=>Math.max(0,g-1))},className:`w-8 h-8 flex items-center justify-center rounded-md font-black transition-colors ${s===0?"opacity-30 cursor-not-allowed":"bg-white dark:bg-neutral-800 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"}`,children:u.jsx(Zf,{size:14})}),u.jsx("span",{className:"font-mono text-sm font-bold flex-1 text-center text-indigo-600 dark:text-indigo-400",children:Rt[s]}),u.jsx("button",{onMouseDown:p=>{p.preventDefault(),a(g=>Math.min(Rt.length-1,g+1))},className:`w-8 h-8 flex items-center justify-center rounded-md font-black transition-colors ${s===Rt.length-1?"opacity-30 cursor-not-allowed":"bg-white dark:bg-neutral-800 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"}`,children:u.jsx(At,{size:14})})]}),u.jsxs("div",{className:"flex gap-2",children:[u.jsx("button",{onMouseDown:p=>{p.preventDefault(),l(!1)},className:`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${n?"border-neutral-700 hover:bg-neutral-700":"border-neutral-200 hover:bg-neutral-100"}`,children:"Cancel"}),u.jsx("button",{onMouseDown:p=>{p.preventDefault();const g=Rt[s],S=qf(e.name,e.description,e.foot,g);t({description:S}),l(!1)},className:"flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors",children:"Apply"})]})]}),e.showNote&&u.jsx("textarea",{onTouchStart:m,onMouseDown:m,value:e.note||"",onChange:p=>t({note:p.target.value}),placeholder:"Note...",className:`w-full mt-2 p-2 rounded-lg text-xs outline-none ${n?"bg-black text-indigo-300":"bg-white border text-indigo-800"}`})]}),u.jsxs("div",{className:"col-span-1 sm:col-span-2 grid grid-cols-2 sm:flex sm:flex-col gap-2 sm:gap-1 min-w-0",children:[u.jsxs("div",{className:"min-w-0",children:[u.jsx("div",{className:"sm:hidden text-[10px] font-black uppercase tracking-widest opacity-50 mb-1",children:"Foot"}),u.jsxs("select",{onTouchStart:m,onMouseDown:m,value:e.foot,onChange:p=>{const g=p.target.value;e.foot==="R"&&g==="L"||e.foot==="L"&&g==="R"?t({foot:g,name:Mn(e.name),description:Mn(e.description)}):t({foot:g})},className:"w-full sm:w-auto rounded-xl px-3 py-2 sm:px-0 sm:py-0 sm:rounded-none outline-none cursor-pointer font-black text-[10px] bg-neutral-100 text-neutral-900 sm:bg-transparent sm:text-inherit",children:[u.jsx("option",{value:"R",children:"R"}),u.jsx("option",{value:"L",children:"L"}),u.jsx("option",{value:"Both",children:"Both"}),u.jsx("option",{value:"None",children:"None"})]})]}),u.jsxs("div",{children:[u.jsx("div",{className:"sm:hidden text-[10px] font-black uppercase tracking-widest opacity-50 mb-1",children:"Weight"}),u.jsx("label",{className:"flex h-[42px] sm:h-auto items-center justify-center rounded-xl sm:rounded-none px-3 sm:px-0 bg-neutral-100 text-neutral-900 sm:bg-transparent sm:text-inherit",children:u.jsx("input",{onTouchStart:m,onMouseDown:m,type:"checkbox",checked:!!e.weight,onChange:p=>t({weight:p.target.checked}),className:"accent-indigo-600"})})]})]})]})}function Zo({clipboard:e,onPaste:t,onHold:r,dark:o}){const n=rc((i,l)=>r(i,l),()=>{e&&t()});return u.jsxs("div",{...n,className:`h-4 -my-2 flex items-center justify-center cursor-pointer transition-all duration-300 relative z-10 ${e?"opacity-100 py-4":"opacity-0 hover:opacity-100 py-1"}`,children:[u.jsx("div",{className:`w-full h-[2px] rounded-full ${o?"bg-indigo-900/40":"bg-indigo-200"} ${e?"bg-indigo-500":""}`}),e&&u.jsx("div",{className:"absolute px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg",children:"Tap to Paste"})]})}function mg({onClose:e,predictedFoot:t,onSelect:r,dark:o,onActionSound:n}){
const[i,l]=W.useState(""),[s,a]=W.useState(null),[d,m]=W.useState(2),[p,g]=W.useState("All Steps"),S=["All Steps","Beginner","Improver","Intermediate","Advanced"],b=W.useDeferredValue(i.trim().toLowerCase()),x=W.useMemo(()=>{
const levelRank={Beginner:0,Improver:1,Intermediate:2,Advanced:3},levels=["Beginner","Improver","Intermediate","Advanced"],improverWords=["balance step","ball change","chasse","shuffle","coaster","cross unwind","crossing triple","cross shuffle","drag","draw","grind","jazz box","leap","paddle turn","restart","triple step","triple turn","skate","slide","twinkle","scissor step"],intermediateWords=["boogie","break step","break turn","cha cha","chug","cuban motion","heel ball change","heel ball cross","heel jack","heel pivot","heel turn","heel twist","hip lift","kick ball change","kick ball cross","lock step","lunge","mambo","mashed potatoes","monterey","press","progressive turn","roll","ronde","sailor","scissors","scoot","spin","stationary turn","switch","swivet","three step turn","toe heel cross","torque","turn in/out","vaudeville","syncopated","nightclub","spiral","hinge turn","diamond","wizard","rolling vine","unwind"],advancedWords=["botafogo","volta","corta jaca","samba","carioca","argentine","cruzados","promenade","counter promenade","shadow","dropped","same foot","contra botafogo","full diamond","fallaway diamond"],hasAny=(P,f)=>f.some(c=>P.includes(c)),classifyStep=P=>{const f=`${P.name||""} ${P.desc||""} ${P.counts||""}`.toLowerCase();let c=0;hasAny(f,improverWords)&&(c=Math.max(c,2)),hasAny(f,intermediateWords)&&(c=Math.max(c,4)),hasAny(f,advancedWords)&&(c=Math.max(c,7)),P.needsTurn&&(c+=1),/\b(1\/2|3\/4|full|360|540)\b/.test(f)&&(c+=2),/\b(syncopated|diamond|wizard|spiral|nightclub|samba|botafogo|volta|carioca|shadow|promenade)\b/.test(f)&&(c+=1),/\b(full|double) turn\b/.test(f)&&(c+=2);return c>=8?"Advanced":c>=4?"Intermediate":c>=2?"Improver":"Beginner"},cleanDesc=P=>String(P||"").replace(/\s+/g," ").trim().replace(/\.$/,""),lowerFirst=P=>P?P.charAt(0).toLowerCase()+P.slice(1):"",makeEntry=(P,f,c="")=>{const h={name:P.name,counts:P.counts,needsTurn:!!P.needsTurn,searchText:`${pg(P)} ${P.name||""} ${P.desc||""} ${f} ${c}`.trim(),difficulty:f,L:null,R:null,generic:null};return P.foot==="L"?h.L=P:P.foot==="R"?h.R=P:h.generic=P,h},makeVariant=(P,f,c,h,v="")=>({...P,name:f,desc:c,virtual:!0,baseName:P.name,difficulty:h,searchBits:v}),buildVariants=(P,f)=>{const c=`${P.name||""} ${P.desc||""}`.toLowerCase(),h=[],v=/samba|botafogo|volta|carioca|corta jaca|cruzados|argentine|promenade|counter promenade/.test(c),L=/turn|pivot|roll|rolling|spin|spiral|diamond|hinge|monterey|nightclub|unwind/.test(c)||P.needsTurn,N=/walk|run|shuffle|chasse|triple|lock|vine|weave|sailor|skate|slide|grapevine|coaster|mambo|wizard|botafogo|volta|samba|step/.test(c),Q=/cross|behind|weave|vine|scissor|sailor|botafogo|volta|grapevine/.test(c),w=/shuffle|triple|sailor|lock|heel|toe|kick|ball|coaster|chasse|vaudeville|wizard|syncopated/.test(c),y=/vine|grapevine|walk|step|triple|lock|spin|turn|roll|diamond|weave/.test(c),R=cleanDesc(P.desc||P.name),T=(A,O,H,M="")=>h.push(makeVariant(P,A,O,levels[Math.min(3,levelRank[f]+H)],M));return levelRank[f]<=2&&(N&&T(`Travelling ${P.name}`,`Travel across the floor while ${lowerFirst(R)}.`,1,"travel travelling floor"),N&&T(`Diagonal ${P.name}`,`Angle the pattern onto a diagonal while ${lowerFirst(R)}.`,1,"diagonal angle"),Q&&T(`Crossing ${P.name}`,`Use a tighter crossing action while ${lowerFirst(R)}.`,1,"crossing cross"),w&&T(`Syncopated ${P.name}`,`Dance a quicker syncopated version while ${lowerFirst(R)}.`,1,"syncopated faster rhythm"),(L||N)&&T(`1/4 Turning ${P.name}`,`Add a controlled 1/4 turn while ${lowerFirst(R)}.`,1,"quarter turn 1/4"),(L||N)&&T(`1/2 Turning ${P.name}`,`Add a controlled 1/2 turn while ${lowerFirst(R)}.`,2,"half turn 1/2"),/lock|shuffle|chasse|coaster|sailor|mambo|wizard|weave|vine/.test(c)&&T(`Progressive ${P.name}`,`Keep the pattern moving forward rather than settling on the spot while ${lowerFirst(R)}.`,1,"progressive moving forward"),N&&w&&T(`Travelling Syncopated ${P.name}`,`Travel while using tighter syncopated timing through the pattern and ${lowerFirst(R)}.`,2,"travelling syncopated faster"),Q&&w&&T(`Syncopated Crossing ${P.name}`,`Use a faster syncopated crossing action while ${lowerFirst(R)}.`,2,"syncopated crossing"),N&&(L||Q)&&T(`Travelling 1/4 Turning ${P.name}`,`Travel through the floor while shaping a 1/4 turn and ${lowerFirst(R)}.`,2,"travelling quarter turn 1/4"),y&&T(`Rolling ${P.name}`,`Smooth the action into a rolling feel while ${lowerFirst(R)}.`,2,"rolling smoother"),N&&Q&&T(`Diagonal Crossing ${P.name}`,`Take the pattern onto a diagonal with a stronger crossing path while ${lowerFirst(R)}.`,2,"diagonal crossing"),N&&L&&T(`Progressive Turning ${P.name}`,`Keep travelling while the movement keeps turning and ${lowerFirst(R)}.`,2,"progressive turning"),w&&(L||N)&&T(`Syncopated Turning ${P.name}`,`Use tighter syncopated timing while turning through the action and ${lowerFirst(R)}.`,2,"syncopated turning"),N&&y&&T(`Travelling Rolling ${P.name}`,`Travel through the floor with a smoother rolling action while ${lowerFirst(R)}.`,2,"travelling rolling")),(levelRank[f]>=2||v)&&(L||N)&&T(`3/4 Turning ${P.name}`,`Drive the pattern through a 3/4 turn while ${lowerFirst(R)}.`,1,"three quarter turn 3/4"),(levelRank[f]>=2||v)&&L&&T(`Full Turn ${P.name}`,`Complete a full turn through the movement while ${lowerFirst(R)}.`,1,"full turn 360"),(levelRank[f]>=2||v)&&N&&T(`Continuous ${P.name}`,`Repeat the action continuously while travelling and ${lowerFirst(R)}.`,1,"continuous repeating"),(levelRank[f]>=2||v)&&N&&T(`Circular ${P.name}`,`Shape the pattern around a circular path while ${lowerFirst(R)}.`,1,"circular arc"),(levelRank[f]>=2||v)&&L&&T(`Spiral ${P.name}`,`Finish the action with a tighter spiral feeling while ${lowerFirst(R)}.`,1,"spiral finish"),v&&(T(`Shadow ${P.name}`,`Dance the action in shadow shape while ${lowerFirst(R)}.`,1,"shadow position"),T(`Promenade ${P.name}`,`Open the body to promenade while ${lowerFirst(R)}.`,1,"promenade"),T(`Counter Promenade ${P.name}`,`Change the body shape to counter-promenade while ${lowerFirst(R)}.`,1,"counter promenade"),T(`Contra ${P.name}`,`Use a contra action through the pattern while ${lowerFirst(R)}.`,1,"contra action"),T(`Dropped ${P.name}`,`Lower the action into a dropped variation while ${lowerFirst(R)}.`,1,"dropped lowered")),h},dedupe=new Map,add=(P,f,c="")=>{const h=makeEntry(P,f,c),v=`${h.name}|${P.foot||"G"}|${h.counts||""}|${f}|${P.desc||""}`;dedupe.has(v)||dedupe.set(v,h)};return gg.forEach(P=>{const f=classifyStep(P);add(P,f),buildVariants(P,f).forEach(c=>add(c,c.difficulty,c.searchBits||""))}),Array.from(dedupe.values()).sort((P,f)=>levelRank[P.difficulty]-levelRank[f.difficulty]||P.name.localeCompare(f.name))},[]),P=W.useMemo(()=>x.filter(f=>(p==="All Steps"||f.difficulty===p)&&(b?f.searchText.toLowerCase().includes(b):!0)).slice(0,b?300:p==="All Steps"?120:140),[x,b,p]),f=Q=>{const c0=Q[t]||Q.generic||Q.L||Q.R,c=c0?{...c0,difficulty:Q.difficulty}:c0;Q.needsTurn?(n&&n(),m(2),a(c)):(n&&n(),r(c,""))},c=t==="R"?"Right Foot":t==="L"?"Left Foot":t;return u.jsx("div",{className:"fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden",children:u.jsxs("div",{className:`w-full max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden max-h-[85vh] ${o?"bg-neutral-900":"bg-white"}`,children:[u.jsxs("div",{className:"p-5 border-b flex justify-between items-center",children:[u.jsx("h2",{className:"font-black uppercase tracking-tight",children:"Smart Glossary"}),u.jsx("button",{onClick:e,children:u.jsx(Ud,{})})]}),s?u.jsxs("div",{className:"p-6 text-center animate-in slide-in-from-right-2",children:[u.jsx("h3",{className:"text-2xl font-black mb-2",children:s.name}),u.jsx("p",{className:"text-xs opacity-60 mb-3 uppercase tracking-widest font-bold",children:s.difficulty||p}),u.jsx("p",{className:"text-xs opacity-60 mb-8 uppercase tracking-widest font-bold",children:"Select turn amount to finish"}),u.jsxs("div",{className:"flex items-center justify-center gap-4 mb-10",children:[u.jsx("button",{onClick:()=>m(Q=>Math.max(0,Q-1)),className:`w-12 h-12 flex items-center justify-center rounded-xl shadow-sm font-black transition-colors ${d===0?"opacity-30 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800":"bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"}`,children:u.jsx(Zf,{size:24})}),u.jsx("div",{className:`w-36 text-center border-2 rounded-xl py-3 ${o?"border-indigo-500/30 bg-indigo-900/10":"border-indigo-200 bg-indigo-50/50"}`,children:u.jsx("span",{className:"font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400",children:Rt[d]})}),u.jsx("button",{onClick:()=>m(Q=>Math.min(Rt.length-1,Q+1)),className:`w-12 h-12 flex items-center justify-center rounded-xl shadow-sm font-black transition-colors ${d===Rt.length-1?"opacity-30 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800":"bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"}`,children:u.jsx(At,{size:24})})]}),u.jsxs("div",{className:"flex justify-center gap-3",children:[u.jsx("button",{onClick:()=>a(null),className:`px-6 py-3 rounded-xl font-bold border transition-colors ${o?"border-neutral-700 hover:bg-neutral-800 text-neutral-300":"border-neutral-200 hover:bg-neutral-100 text-neutral-600"}`,children:"Back to Results"}),u.jsx("button",{onClick:()=>r(s,Rt[d]),className:"px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors",children:"Apply Move"})]})]}):u.jsxs(u.Fragment,{children:[u.jsxs("div",{className:"p-3 bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest text-center",children:["Matching: ",c]}),u.jsx("div",{className:"p-4",children:u.jsx("input",{value:i,onChange:Q=>l(Q.target.value),placeholder:`Search ${tc.toLocaleString()} step variations...`,className:`w-full p-3 rounded-2xl outline-none border ${o?"bg-neutral-800 border-neutral-700":"bg-neutral-100 border-neutral-200"}`,autoFocus:!0})}),u.jsx("div",{className:"px-4 pb-3 flex flex-wrap gap-2",children:S.map(Q=>u.jsx("button",{onClick:()=>g(Q),className:`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${p===Q?"bg-indigo-600 text-white border-indigo-600":"border-neutral-300 dark:border-neutral-700 hover:border-indigo-500 hover:text-indigo-500"}`,children:Q},Q))}),u.jsx("div",{className:"px-4 pb-2 text-[10px] font-black uppercase tracking-widest opacity-50",children:b?p==="All Steps"?`Showing ${P.length} matches across all levels`:`Showing ${P.length} ${p} matches`:p==="All Steps"?`Showing a mixed slice from every level. Search or tap a badge to narrow it.`:`Showing ${p} moves first. Search to narrow more steps.`}),u.jsxs("div",{className:"flex-1 overflow-y-auto p-2 space-y-1",children:[P.length===0&&u.jsx("div",{className:`px-4 py-8 text-center text-sm ${o?"text-neutral-400":"text-neutral-500"}`,children:"No matching steps in this level yet. Try another tag or a simpler search."}),P.map(Q=>{const h=Q[t]||Q.generic||Q.L||Q.R;const v=h?{...h,difficulty:Q.difficulty}:h;return u.jsxs("button",{onClick:()=>f(Q),className:"w-full text-left p-4 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all flex justify-between items-center group",children:[u.jsxs("div",{className:"flex-1 min-w-0 pr-4",children:[u.jsxs("div",{className:"font-bold flex items-center gap-2 flex-wrap",children:[(h==null?void 0:h.name)||Q.name,Q.needsTurn&&u.jsx("span",{className:"text-[8px] bg-amber-500/20 text-amber-500 px-1 rounded",children:"TURN"}),(h==null?void 0:h.foot)&&h.foot!=="None"&&u.jsxs("span",{className:"text-[8px] bg-indigo-500/15 text-indigo-500 px-1 rounded",children:["START ",h.foot]}),u.jsx("span",{className:"text-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1 rounded",children:Q.difficulty})]}),u.jsx("div",{className:"text-[10px] opacity-60 truncate",children:(v==null?void 0:v.desc)||""})]}),u.jsx("div",{className:"shrink-0 text-[10px] font-mono opacity-40",children:Q.counts})]},Q.name)})]})]})]})})}function Cl({size:e=16,className:t=""}){return u.jsx("span",{className:`inline-flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300 ${t}`.trim(),children:u.jsx(Dd,{style:{width:e,height:e}})})}function wg({dark:e}){const t=["Android dark-mode buttons and black UI strips now keep white text, the B / I / U controls wrap selected text instantly, and page switches now start when the transition animation kicks off.","Counts and Walls can stay on Auto now, and the Sheet view shows the real detected numbers instead of printing AUTO.","I changed the page transition again so the new square-step icon animation stays fixed in the middle, plays right through, holds on the last frame for a beat, then fades off cleanly instead of looking like it swipes sideways.","I also kept that same square-step icon animation on startup, so the app opens with the matching branded splash before the editor appears.","I gave the buttons and squircle-style icon tiles a polished stone texture with a diagonal hover glint so the controls look a bit sharper instead of flat." ,"I rebuilt the Smart Glossary levels so All Steps is the default, the badges are cleaner, and the level split behaves more like a real line-dance progression.","I massively expanded the Smart Glossary so it now represents 1,587,322 possible step variations across the generated move families, with much fatter Intermediate and Advanced coverage than before.","I added glossary difficulty tags at the top so you can jump between Beginner, Improver, Intermediate and Advanced moves instead of loading one giant lump.","I added a Copy in Docs Format button so you can paste a clean, tight version anywhere without the giant gaps.","The preview print button now squeezes the sheet onto a single portrait PDF page instead of blindly spilling onto multiple pages.","I tightened up the Android layout so the editor sits properly on a phone screen instead of spilling off the sides.","I fixed the context menu so tapping an action does not also fire the button sitting behind it.","I trimmed the startup path again, so the app gets to the UI faster when you open it offline.","The glossary now shows a useful first batch of results instead of trying to dump everything on screen at once.","I added this What's New tab so you can see changes in the app itself instead of hunting through chat.","Under the hood, the glossary now reflects a generated library of 1,587,322 possible step variations, but the UI still only renders the slice that is actually useful so the app does not choke itself to death."];return u.jsxs("section",{className:`rounded-3xl border shadow-sm overflow-hidden ${e?"bg-neutral-900 border-neutral-800":"bg-white border-neutral-200"}`,children:[u.jsx("div",{className:`px-6 py-5 border-b ${e?"bg-neutral-900 border-neutral-800":"bg-neutral-50 border-neutral-200"}`,children:u.jsxs("h2",{className:"text-2xl font-black tracking-tight uppercase flex items-center gap-2",children:[u.jsx(Cl,{size:14,className:"w-8 h-8"})," What's New"]})}),u.jsxs("div",{className:"p-6 sm:p-8 space-y-6",children:[u.jsx("div",{className:`rounded-2xl border p-5 ${e?"bg-neutral-950 border-neutral-800":"bg-indigo-50/50 border-indigo-100"}`,children:u.jsxs("p",{className:"text-base sm:text-lg font-bold leading-relaxed",children:["This app will get better faster if real dancers keep picking at it. If you spot a missing step, dodgy wording, or anything that feels off, email me"," ",u.jsx("a",{href:`mailto:${_n}`,className:"text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-2 break-all",children:_n})," ","and I'll roll it into the next update."]})}),u.jsx("div",{className:"space-y-3",children:t.map((r,o)=>u.jsxs("div",{className:`rounded-2xl border px-4 py-4 flex gap-3 ${e?"border-neutral-800 bg-neutral-950":"border-neutral-200 bg-white"}`,children:[u.jsx("div",{className:"mt-0.5 shrink-0",children:u.jsx(Cl,{size:12,className:"w-6 h-6"})}),u.jsx("p",{className:"font-medium leading-relaxed",children:r})]},o))})]})]})}function vg({dark:e}){return u.jsx("div",{className:`rounded-2xl border px-4 py-4 text-sm sm:text-base text-center shadow-sm ${e?"bg-neutral-900 border-neutral-800 text-neutral-200":"bg-white border-neutral-200 text-neutral-700"}`,children:u.jsxs("p",{className:"font-semibold",children:["Have I missed a step? Email me any steps you miss and will be on site soon!"," ",u.jsx("a",{href:`mailto:${_n}`,className:"font-black text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-2 break-all",children:_n})]})})}function Sg(e){const t=((e==null?void 0:e.choreographer)||"").trim(),r=((e==null?void 0:e.country)||"").trim();return t?r?`${t} (${r})`:t:"-"}function yg({meta:e,sections:t,tags:r,dark:o}){
  const [n,i]=W.useState(!1);

  const l=()=>{
    try{
      if(typeof window<"u"&&typeof document<"u"){
        const c=document.getElementById("print-sheet");
        const h=document.getElementById("print-sheet-wrap");
        if(c&&h){
          const v=c.style.transform;
          const L=c.style.width;
          const N=h.style.minHeight;
          const z=h.style.padding;
          const j=()=>{
            c.style.transform=v;
            c.style.width=L;
            h.style.minHeight=N;
            h.style.padding=z;
            window.removeEventListener("afterprint",j);
          };
          h.style.padding="0";
          c.style.transform="scale(1)";
          c.style.width="100%";
          h.style.minHeight="auto";
          requestAnimationFrame(()=>{
            requestAnimationFrame(()=>{
              const V=96;
              const D=210/25.4*V;
              const ye=297/25.4*V;
              const Mt=12/25.4*V;
              const Wt=D-Mt*2;
              const No=ye-Mt*2;
              const Fr=c.getBoundingClientRect();
              const Er=Math.max(1,Fr.width);
              const ti=Math.max(1,c.scrollHeight,Fr.height);
              const Dr=Math.min(1,Wt/Er,No/ti);
              c.style.transformOrigin="top center";
              c.style.transform=`scale(${Dr})`;
              c.style.width=`${Er/Dr}px`;
              h.style.minHeight=`${ti*Dr}px`;
              window.addEventListener("afterprint",j,{once:!0});
              window.print();
              setTimeout(j,1500);
            });
          });
          return;
        }
      }
      window.print();
    }catch{}
  };

  const s=(c)=>{
    if(c.type==="marker"){
      const h=c.markerType==="restart";
      return `*** ${h?"RESTART":"TAG"} HERE ON WALL ${c.wall||"_"} ***`;
    }
    const v=(c.name||"").trim();
    const L=(c.description||"").trim();
    const N=(c.foot||"").trim();
    const z=(c.note||"").trim();
    const j=[];
    if(c.count) j.push(`${c.count}:`);
    if(v&&L) j.push(`${v}: ${L}`);
    else if(v) j.push(v);
    else if(L) j.push(L);
    if(N) j.push(`[${N}]`);
    if(c.showNote&&z) j.push(`(Note: ${z})`);
    return j.join(" ").replace(/\s+/g," ").trim();
  };

  const a=(c,h)=>{
    const v=[];
    let L=0;
    for(const N of c||[]){
      L+=1;
      const z=(N?.name)||`${h} ${L}`;
      const j=(N?.steps)||[];
      v.push(z);
      for(const V of j) v.push(s(V));
      v.push("");
    }
    return v;
  };

  const d=async()=>{
    const c=[];
    const h=(e.title||"Untitled Dance").trim();
    c.push(h);

    const v=[];
    if(e.counts) v.push(`Count: ${e.counts}`);
    if(e.walls) v.push(`Wall: ${e.walls}`);
    if(e.level) v.push(`Level: ${e.level}`);
    if(v.length) c.push(v.join(" | "));

    const L=Sg(e);
    if(L) c.push(`Choreographer: ${L}`);
    if(e.music) c.push(`Music: ${e.music}`);
    c.push("");

    c.push(...a(t,"Section"));

    if(r&&r.length){
      c.push("Tags & Bridges","");
      for(const N of r){
        c.push(N?.name||"Untitled Tag");
        for(const z of (N?.sections)||[]){
          if(z?.name) c.push(z.name);
          for(const j of (z?.steps)||[]) c.push(s(j));
          c.push("");
        }
      }
    }

    const N=c.join("\n").replace(/\n{3,}/g,"\n\n").trim();
    let z=!1;

    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){
        await navigator.clipboard.writeText(N);
        z=!0;
      }
    }catch{}

    if(!z){
      try{
        const j=document.createElement("textarea");
        j.value=N;
        j.setAttribute("readonly","");
        j.style.position="fixed";
        j.style.opacity="0";
        document.body.appendChild(j);
        j.focus();
        j.select();
        z=document.execCommand("copy");
        document.body.removeChild(j);
      }catch{}
    }

    i(!0);
    window.setTimeout(()=>i(!1),1600);
    if(!z) window.prompt("Copy this text:",N);
  };

  const m=(c)=>{
    if(c.type==="marker"){
      const h=c.markerType==="restart";
      return u.jsxs("div",{
        className:`py-3 my-4 text-center font-black uppercase tracking-widest text-sm border-y-2 print:border-y-2 print:py-2 print:my-2 ${h?"text-red-500 border-red-500/20 print:text-black print:border-black":"text-orange-500 border-orange-500/20 print:text-black print:border-black"}`,
        children:["*** ",h?"RESTART":"TAG"," HERE ON WALL ",c.wall||"_"," ***"]
      },c.id);
    }
    return u.jsxs("div",{
      className:"flex gap-4 sm:gap-8 group items-start",
      children:[
        u.jsx("div",{className:"w-12 text-right font-black text-lg sm:text-xl shrink-0 print:text-black",children:c.count}),
        u.jsxs("div",{
          className:"flex-1 text-base sm:text-lg leading-tight print:text-black",
          children:[
            u.jsxs("span",{className:"font-bold",children:[c.name,":"]}),
            " ",
            c.description,
            u.jsxs("span",{className:"text-[10px] ml-4 font-mono opacity-30 print:opacity-100 print:text-gray-500",children:["[",c.foot,"]"]}),
            c.showNote&&u.jsxs("div",{className:"mt-1 text-sm italic text-indigo-500 opacity-80 print:text-gray-700",children:["Note: ",c.note]})
          ]
        })
      ]
    },c.id);
  };

  return u.jsxs("div",{
    id:"print-sheet-wrap",
    className:"relative",
    children:[
      u.jsx("div",{
        className:"absolute top-4 right-4 print:hidden z-10",
        children:u.jsxs("div",{
          className:"flex flex-col items-end gap-2",
          children:[
            u.jsxs("button",{
              onClick:l,
              className:"flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors",
              children:[u.jsx(Ll,{size:16})," Save PDF / Print (1 Page)"]
            }),
            u.jsx("button",{
              onClick:d,
              className:"px-4 py-2 bg-white/95 dark:bg-neutral-900/95 border border-neutral-300 dark:border-neutral-700 rounded-xl font-bold text-sm shadow-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
              children:n?"Copied for Docs":"Copy in Docs Format"
            })
          ]
        })
      }),
      u.jsxs("div",{
        id:"print-sheet",
        className:`p-6 sm:p-10 rounded-3xl shadow-2xl min-h-[800px] font-serif print:shadow-none print:border-none print:p-0 print:bg-white print:text-black ${o?"bg-neutral-900 border border-neutral-800":"bg-white border border-neutral-200"}`,
        children:[
          u.jsx("h1",{className:"text-4xl font-black text-center mb-10 tracking-tighter uppercase leading-tight print:text-black",children:e.title||"Untitled Dance"}),
          u.jsxs("div",{
            className:"flex flex-wrap gap-4 sm:gap-10 justify-center border-y py-6 mb-12 uppercase text-[10px] font-black tracking-widest opacity-60 print:opacity-100 print:text-black print:border-black",
            children:[
              u.jsxs("div",{children:["Count: ",u.jsx("span",{className:"text-sm font-bold opacity-100 print:text-black",children:e.counts})]}),
              u.jsxs("div",{children:["Wall: ",u.jsx("span",{className:"text-sm font-bold opacity-100 print:text-black",children:e.walls})]}),
              u.jsxs("div",{children:["Level: ",u.jsx("span",{className:"text-sm font-bold opacity-100 print:text-black",children:e.level})]}),
              u.jsxs("div",{className:"w-full text-center mt-2",children:["Choreographer: ",u.jsx("span",{className:"text-sm font-bold opacity-100 print:text-black",children:Sg(e)})]}),
              u.jsxs("div",{className:"w-full text-center",children:["Music: ",u.jsx("span",{className:"text-sm font-bold italic opacity-100 print:text-black",children:e.music||"-"})]})
            ]
          }),
          u.jsx("div",{
            className:"space-y-12 print:space-y-8",
            children:(t||[]).map((c,h)=>u.jsxs("div",{
              className:"print:break-inside-avoid",
              children:[
                u.jsx("h2",{className:"text-lg font-black italic border-b-2 border-current pb-1 mb-6 uppercase tracking-widest print:text-black print:border-black",children:c.name||`Section ${h+1}`}),
                u.jsx("div",{className:"space-y-4 print:space-y-3",children:(c.steps||[]).map(v=>m(v))})
              ]
            },h))
          }),
          r&&r.length>0&&u.jsxs("div",{
            className:"mt-16 space-y-12 print:mt-10 print:space-y-8",
            children:[
              u.jsx("div",{className:`border-b-4 pb-2 print:border-black print:border-b-2 ${o?"border-white":"border-neutral-900"}`,children:u.jsx("h1",{className:"text-3xl font-black tracking-tighter uppercase print:text-2xl print:text-black",children:"Tags & Bridges"})}),
              r.map(c=>u.jsxs("div",{
                className:"space-y-8 print:space-y-6 print:break-inside-avoid",
                children:[
                  u.jsx("h2",{className:"text-2xl font-black uppercase text-orange-500 print:text-black",children:c.name||"Untitled Tag"}),
                  (c.sections||[]).map(h=>u.jsxs("div",{
                    children:[
                      h.name&&u.jsx("h3",{className:"text-sm font-black italic border-b border-current pb-1 mb-4 uppercase tracking-widest opacity-60 print:opacity-100 print:text-black",children:h.name}),
                      u.jsx("div",{className:"space-y-4 print:space-y-3",children:(h.steps||[]).map(v=>m(v))})
                    ]
                  },h.id))
                ]
              },c.id))
            ]
          })
        ]
      })
    ]
  });
}
function kg(){const[e,t]=W.useState("editor"),[r,o]=W.useState(!1),[n,i]=W.useState(null),[l,s]=W.useState(null),[a,d]=W.useState(0),[m,p]=W.useState({isOpen:!1,isTag:!1,tagId:null,sectionId:null,predictedFoot:"R",replaceStepId:null}),[g,S]=W.useState({title:"",choreographer:"",country:"",level:"Beginner",counts:"32",walls:"4",music:"",type:"8-count",startFoot:"Right"}),[b,x]=W.useState([{id:ie(),name:"",steps:[{id:ie(),type:"step",count:"",name:"",description:"",foot:"R",weight:!0,showNote:!1,note:""}]}]),[P,f]=W.useState([]),c=W.useRef({}),h=w=>{if(typeof window>"u")return;const y=Gd[w];if(y)try{if(!c.current[w]){const $=new Audio(y);$.preload="auto",c.current[w]=$}const R=c.current[w];R.currentTime=0;const T=R.play();T&&typeof T.catch=="function"&&T.catch(()=>{})}catch{}},v=w=>{h("menuOpen"),s(w)},L=()=>{d(Date.now()+Kd)};W.useEffect(()=>{if(typeof window>"u")return;let w=!1;const y=()=>{if(!w)try{const T=localStorage.getItem(Ea);if(T){const $=JSON.parse(T);$.meta&&S(_=>({..._,...$.meta})),$.sections&&Array.isArray($.sections)&&x($.sections),$.tags&&Array.isArray($.tags)&&f($.tags),typeof $.isDarkMode=="boolean"&&o($.isDarkMode)}}catch{console.error("Storage read failed safely.")}},R=window.requestAnimationFrame?window.requestAnimationFrame(y):window.setTimeout(y,0);return()=>{w=!0,window.cancelAnimationFrame&&typeof R=="number"?window.cancelAnimationFrame(R):window.clearTimeout(R)}},[]),W.useEffect(()=>{if(typeof window<"u")try{localStorage.setItem(Ea,JSON.stringify({meta:g,sections:b,tags:P,isDarkMode:r}))}catch{console.error("Storage write failed safely.")}},[g,b,P,r]),W.useEffect(()=>{if(!a)return;const w=Math.max(0,a-Date.now()),y=window.setTimeout(()=>d(0),w);return()=>window.clearTimeout(y)},[a]);const N=(w,y)=>{S(R=>({...R,[w]:y}))},z=(w,y)=>{x(R=>R.map(T=>T.id===w?{...T,name:y}:T))},j=w=>{x(y=>y.filter(R=>R.id!==w))},V=(w,y,R)=>{x(T=>T.map($=>$.id===w?{...$,steps:[...($.steps||[]).slice(0,y),R,...($.steps||[]).slice(y)]}:$))},D=(w,y)=>{x(R=>R.map(T=>T.id===w?{...T,steps:(T.steps||[]).filter($=>$.id!==y)}:T))},ye=(w,y,R)=>{x(T=>T.map($=>$.id===w?{...$,steps:($.steps||[]).map(_=>_.id===y?{..._,...R}:_)}:$))},Mt=()=>{f(w=>[...w,{id:ie(),name:`Tag ${w.length+1}`,sections:[{id:ie(),name:"",steps:[{id:ie(),type:"step",count:"",name:"",description:"",foot:I(),weight:!0,showNote:!1,note:""}]}]}])},Wt=w=>{f(y=>y.filter(R=>R.id!==w))},No=(w,y)=>{f(R=>R.map(T=>T.id===w?{...T,name:y}:T))},ti=w=>{f(y=>y.map(R=>R.id===w?{...R,sections:[...R.sections,{id:ie(),name:"",steps:[{id:ie(),type:"step",count:"",name:"",description:"",foot:I(),weight:!0,showNote:!1,note:""}]}]}:R))},Er=(w,y)=>{f(R=>R.map(T=>T.id===w?{...T,sections:T.sections.filter($=>$.id!==y)}:T))},Fr=(w,y,R)=>{f(T=>T.map($=>$.id===w?{...$,sections:$.sections.map(_=>_.id===y?{..._,name:R}:_)}:$))},C=(w,y,R,T)=>{f($=>$.map(_=>_.id===w?{..._,sections:_.sections.map(q=>q.id===y?{...q,steps:[...(q.steps||[]).slice(0,R),T,...(q.steps||[]).slice(R)]}:q)}:_))},E=(w,y,R)=>{f(T=>T.map($=>$.id===w?{...$,sections:$.sections.map(_=>_.id===y?{..._,steps:(_.steps||[]).filter(q=>q.id!==R)}:_)}:$))},F=(w,y,R,T)=>{f($=>$.map(_=>_.id===w?{..._,sections:_.sections.map(q=>q.id===y?{...q,steps:(q.steps||[]).map(re=>re.id===R?{...re,...T}:re)}:q)}:_))},G=W.useMemo(()=>{g.startFoot;let w=null;const y=R=>{(R||[]).forEach(T=>{T.type==="step"&&T.weight!==!1&&(T.foot==="R"||T.foot==="L")&&(T.foot,w=T.foot)})};return(b||[]).forEach(R=>y(R.steps)),{lastWeightBearingFoot:w}},[b,g.startFoot]),I=()=>{const{lastWeightBearingFoot:w}=G;return w?w==="R"?"L":"R":g.startFoot==="Left"?"L":"R"},Ht=(w,y)=>{n&&(h("action"),V(w,y,{...n,id:ie()}))},Xe=(w,y,R)=>{n&&(h("action"),C(w,y,R,{...n,id:ie()}))},Dr=()=>{x(w=>[...w,{id:ie(),name:"",steps:[{id:ie(),type:"step",count:"",name:"",description:"",foot:I(),weight:!0}]}])},nt=(w,y,R,T,$="")=>{h("action");let _=T.counts||"1";if(T.name.toLowerCase().includes("diamond")&&$){let re=1;$==="1/8"?re=.5:$==="1/4"?re=1:$==="3/8"?re=1.5:$==="1/2"?re=2:$==="5/8"?re=2.5:$==="3/4"?re=3:$==="7/8"?re=3.5:$==="full"&&(re=4);let or=[],ee=1;for(let ce=0;ce<Math.ceil(re*2);ce++)or.push(`${ee}&${ee+1}`),ee+=2;_=or.join(" ")}let q=qf(T.name,T.desc,T.foot||"R",$);if(m.replaceStepId)w?F(y,R,m.replaceStepId,{name:T.name,description:q,foot:T.foot||"R",weight:T.weight!==!1}):ye(R,m.replaceStepId,{name:T.name,description:q,foot:T.foot||"R",weight:T.weight!==!1});else{const re=w?P.find(J=>J.id===y):null,ee=(w?re?re.sections:[]:b).find(J=>J.id===R);if(!ee)return;const ce=ee.steps&&ee.steps.length>0?ee.steps[ee.steps.length-1]:null,it=ee.steps&&ee.steps.length===1&&!ee.steps[0].description&&ee.steps[0].type!=="marker",Po=Jo(ce&&!it?ce.count:"",_,g.type),ne={id:ie(),type:"step",count:Po,name:T.name,description:q,foot:T.foot||I(),weight:T.weight!==!1};w?C(y,R,ee.steps?ee.steps.length:0,ne):V(R,ee.steps?ee.steps.length:0,ne),it&&(w?E(y,R,ee.steps[0].id):D(R,ee.steps[0].id))}p({isOpen:!1,isTag:!1,tagId:null,sectionId:null,predictedFoot:"R",replaceStepId:null})},ke=w=>{if(!l)return;const{sectionId:y,stepId:R,index:T,type:$,isTag:_,tagId:q}=l,re=(ce,it)=>_?C(q,y,ce,it):V(y,ce,it),or=ce=>_?E(q,y,ce):D(y,ce),ee=(ce,it)=>_?F(q,y,ce,it):ye(y,ce,it);if($==="step"){const ce=_?P.find(J=>J.id===q):null,Po=(_?ce?ce.sections:[]:b).find(J=>J.id===y);if(!Po){s(null);return}const ne=(Po.steps||[]).find(J=>J.id===R);if(!ne){s(null);return}if(w==="copy"&&(h("action"),i(ne)),w==="cut"&&(h("action"),i(ne),or(R)),w==="duplicate"){const J=Jo(ne.count,ne.count,g.type);let Ot={...ne,id:ie(),count:J};ne.weight!==!1&&(ne.foot==="R"||ne.foot==="L")&&(Ot.foot=ne.foot==="R"?"L":"R",Ot.name=Mn(ne.name),Ot.description=Mn(ne.description)),re(T+1,Ot)}if(w==="change"&&(h("action"),p({isOpen:!0,isTag:_,tagId:q,sectionId:y,predictedFoot:ne.foot,replaceStepId:R})),w==="note"&&(h("action"),ee(R,{showNote:!ne.showNote})),w==="syncopate"){let J=ne.count?String(ne.count):"",Ot=J.includes("&"),ri=g.type==="waltz"?6:8;const _r=Wr=>((Wr-1)%ri+ri)%ri+1;let bs=J.match(/\d+/),Mr=bs?parseInt(bs[0],10):1;if(Ot)J=(J.match(/\d+/g)||[]).join("-");else{let oi=(J.match(/\d+/g)||[]).length;oi===3?J=`${_r(Mr)}&${_r(Mr+1)}`:oi===4?J=`${_r(Mr)}&${_r(Mr+1)}&`:oi===2?J=`${_r(Mr)}&`:J=J+"&"}let be=ne.description||"";Ot?(be=be.replace(/^Quickly /i,""),be=be.replace(/^\(Syncopated\) /i,""),be=be.charAt(0).toUpperCase()+be.slice(1)):!be.toLowerCase().includes("quick")&&!be.toLowerCase().includes("syncopated")&&(/^(Step|Cross|Rock|Touch|Point|Kick|Slide|Drag|Dig|Tap|Heel|Toe)/i.test(be)?be=be.replace(/^(Step|Cross|Rock|Touch|Point|Kick|Slide|Drag|Dig|Tap|Heel|Toe)/i,Wr=>"Quickly "+Wr.toLowerCase()):be="(Syncopated) "+be),ee(R,{count:J,description:be})}w==="remove"&&(h("delete"),or(R))}else $==="gap"&&(w==="paste"&&n&&(h("action"),re(T,{...n,id:ie()})),w==="insert_restart"&&(h("action"),re(T,{id:ie(),type:"marker",markerType:"restart",wall:"",showNote:!1,note:""})),w==="insert_tag"&&(h("action"),re(T,{id:ie(),type:"marker",markerType:"tag",wall:"",showNote:!1,note:""})));L(),setTimeout(()=>s(null),0)},oc=()=>{window.confirm("Clear all steps and tags?")&&(x([{id:ie(),name:"",steps:[{id:ie(),type:"step",count:"",name:"",description:"",foot:"R",weight:!0,showNote:!1,note:""}]}]),f([]),S({...g,title:"",choreographer:"",country:"",music:""}))},nc=typeof window<"u"?window.innerWidth:1e3,ic=typeof window<"u"?window.innerHeight:800;return u.jsxs("div",{className:`min-h-screen transition-colors duration-300 print:bg-white ${r?"dark bg-neutral-950 text-white":"bg-neutral-50 text-neutral-900"}`,children:[(l||a>Date.now())&&u.jsx("div",{className:`fixed inset-0 z-50 print:hidden ${l?"bg-black/5":"bg-transparent"}`,onPointerDown:w=>{w.preventDefault(),w.stopPropagation(),l&&s(null)},onClick:w=>{w.preventDefault(),w.stopPropagation(),l&&s(null)},children:l&&u.jsx("div",{className:`absolute shadow-2xl rounded-xl border py-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-56 animate-in fade-in zoom-in-95 duration-150 ${r?"bg-neutral-800 border-neutral-700":"bg-white border-neutral-200"}`,style:{left:Math.min(l.x,nc-260),top:Math.min(l.y,ic-320)},onPointerDown:w=>{w.preventDefault(),w.stopPropagation()},onClick:w=>{w.preventDefault(),w.stopPropagation()},children:l.type==="step"?u.jsxs(u.Fragment,{children:[u.jsx(qe,{icon:u.jsx(At,{}),label:"Duplicate (Smart)",onClick:()=>ke("duplicate")}),u.jsx(qe,{icon:u.jsx(ja,{}),label:"Replace Move",onClick:()=>ke("change")}),u.jsx(Yo,{dark:r}),u.jsx(qe,{icon:u.jsx(Od,{}),label:"Cut",onClick:()=>ke("cut")}),u.jsx(qe,{icon:u.jsx(_d,{}),label:"Copy",onClick:()=>ke("copy")}),u.jsx(Yo,{dark:r}),u.jsx(qe,{icon:u.jsx(Vd,{}),label:"Add Note",onClick:()=>ke("note")}),u.jsx(Yo,{dark:r}),u.jsx(qe,{icon:u.jsx(Id,{}),label:"Syncopate Count",onClick:()=>ke("syncopate")}),u.jsx(qe,{icon:u.jsx(ir,{}),label:"Remove",color:"text-red-500",onClick:()=>ke("remove")})]}):u.jsxs(u.Fragment,{children:[u.jsx(qe,{icon:u.jsx(Ll,{}),label:"Paste Here",disabled:!n,onClick:()=>ke("paste")}),u.jsx(Yo,{dark:r}),u.jsx(qe,{icon:u.jsx(ja,{}),label:"Insert Restart",color:"text-red-500",onClick:()=>ke("insert_restart")}),u.jsx(qe,{icon:u.jsx(Ni,{}),label:"Insert Tag",color:"text-orange-500",onClick:()=>ke("insert_tag")})]})})}),u.jsxs("header",{className:`sticky top-0 z-40 backdrop-blur-md border-b flex items-center justify-between px-3 sm:px-6 h-16 print:hidden ${r?"bg-neutral-950/80 border-neutral-800":"bg-white/90 border-neutral-200"}`,children:[u.jsxs("div",{className:"flex items-center gap-2 sm:gap-3 min-w-0",children:[u.jsx("div",{className:"p-2 bg-indigo-600 rounded-lg text-white",children:u.jsx(Wd,{className:"w-5 h-5"})}),u.jsxs("span",{className:"font-black text-lg tracking-tighter uppercase hidden sm:block",children:["Step by Stepper ",u.jsx("span",{className:"text-indigo-500",children:"Pro"})]})]}),u.jsxs("div",{className:"flex items-center gap-2 sm:gap-3 min-w-0",children:[u.jsx("button",{onClick:oc,className:"p-2 text-neutral-400 hover:text-red-500 transition-colors",children:u.jsx(ir,{className:"w-5 h-5"})}),u.jsxs("div",{className:"flex min-w-0 max-w-[68vw] sm:max-w-none overflow-x-auto p-1 bg-neutral-200/50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700",children:[u.jsx(Pi,{active:e==="editor",onClick:()=>{window.__stepperRunFaviconTransition?window.__stepperRunFaviconTransition(()=>{h("tabChange"),t("editor")}):(h("tabChange"),t("editor"))},label:"Build",icon:u.jsx(Hd,{className:"w-4 h-4"})}),u.jsx(Pi,{active:e==="preview",onClick:()=>{window.__stepperRunFaviconTransition?window.__stepperRunFaviconTransition(()=>{h("tabChange"),t("preview")}):(h("tabChange"),t("preview"))},label:"Sheet",icon:u.jsx(Ll,{className:"w-4 h-4"})}),u.jsx(Pi,{active:e==="whatsnew",onClick:()=>{window.__stepperRunFaviconTransition?window.__stepperRunFaviconTransition(()=>{h("tabChange"),t("whatsnew")}):(h("tabChange"),t("whatsnew"))},label:"What's New",icon:u.jsx(Cl,{size:12,className:"w-6 h-6"})})]}),u.jsx("button",{onClick:()=>{const w=!r;o(w),h(w?"darkMode":"lightMode")},className:"p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors",children:r?u.jsx(Ad,{}):u.jsx(Md,{})})]})]}),u.jsx("main",{className:"w-full max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 sm:pb-32 overflow-x-hidden print:p-0 print:m-0 print:max-w-none",children:e==="editor"?u.jsxs("div",{className:"space-y-8 animate-in fade-in slide-in-from-bottom-2 print:hidden",children:[u.jsx("section",{className:`p-6 sm:p-8 rounded-3xl border shadow-sm ${r?"bg-neutral-900 border-neutral-800":"bg-white border-neutral-200"}`,children:u.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-6",children:[u.jsx(zi,{label:"Dance Title",value:g.title,onChange:w=>N("title",w),dark:r}),u.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4",children:[u.jsx(zi,{label:"Choreographer",value:g.choreographer,onChange:w=>N("choreographer",w),dark:r}),u.jsx(Xo,{label:"Country",value:g.country||"",options:Qd,onChange:w=>N("country",w),dark:r})]}),u.jsx(zi,{label:"Music",value:g.music,onChange:w=>N("music",w),dark:r}),u.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[u.jsx(Xo,{label:"Level",value:g.level,options:["Absolute Beginner","Beginner","Improver","Intermediate","Advanced"],onChange:w=>N("level",w),dark:r}),u.jsxs("div",{className:"flex gap-2",children:[u.jsx(Xo,{label:"Counts",value:g.counts,options:["16","32","48","64","96"],onChange:w=>N("counts",w),dark:r}),u.jsx(Xo,{label:"Walls",value:g.walls,options:["1","2","4"],onChange:w=>N("walls",w),dark:r})]})]})]})}),(b||[]).map(w=>u.jsxs("div",{className:`rounded-3xl border shadow-sm overflow-hidden ${r?"bg-neutral-900 border-neutral-800":"bg-white border-neutral-200"}`,children:[u.jsxs("div",{className:"px-6 py-4 bg-neutral-100/50 dark:bg-neutral-800/50 border-b flex justify-between items-center",children:[u.jsx("input",{value:w.name,onChange:y=>z(w.id,y.target.value),placeholder:"Section Title...",className:"bg-transparent font-black uppercase tracking-widest outline-none flex-1 text-sm"}),u.jsx("button",{onClick:()=>{h("delete"),j(w.id)},className:"text-neutral-400 hover:text-red-500",children:u.jsx(ir,{className:"w-4 h-4"})})]}),u.jsxs("div",{className:"p-4 sm:p-6 space-y-1",children:[(w.steps||[]).map((y,R)=>u.jsxs(hn.Fragment,{children:[u.jsx(Zo,{clipboard:n,onPaste:()=>Ht(w.id,R),onHold:(T,$)=>v({x:T,y:$,type:"gap",isTag:!1,tagId:null,sectionId:w.id,index:R}),dark:r}),u.jsx(Da,{step:y,onUpdate:T=>ye(w.id,y.id,T),onHold:(T,$)=>v({x:T,y:$,type:"step",isTag:!1,tagId:null,sectionId:w.id,stepId:y.id,index:R}),onRemove:()=>{h("delete"),D(w.id,y.id)},dark:r})]},y.id)),u.jsx(Zo,{clipboard:n,onPaste:()=>Ht(w.id,(w.steps||[]).length),onHold:(y,R)=>v({x:y,y:R,type:"gap",isTag:!1,tagId:null,sectionId:w.id,index:(w.steps||[]).length}),dark:r}),u.jsxs("div",{className:"flex gap-3 mt-6",children:[u.jsxs("button",{onClick:()=>{h("action"),p({isOpen:!0,isTag:!1,tagId:null,sectionId:w.id,predictedFoot:I(),replaceStepId:null})},className:"flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-indigo-700 transition-colors",children:[u.jsx(za,{className:"w-4 h-4"})," Glossary (",tc.toLocaleString(),")"]}),u.jsx("button",{onClick:()=>{h("action");const y=w.steps||[],R=y.length>0?y[y.length-1]:null,T=Jo((R==null?void 0:R.count)||"","1",g.type);V(w.id,y.length,{id:ie(),type:"step",count:T,name:"",description:"",foot:I(),weight:!0})},className:"p-3 bg-neutral-200 dark:bg-neutral-800 rounded-2xl hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors",children:u.jsx(At,{})})]})]})]},w.id)),P&&P.length>0&&u.jsxs("div",{className:"mt-16 space-y-8 animate-in fade-in",children:[u.jsxs("div",{className:`flex items-center gap-3 border-b-2 pb-4 mb-8 ${r?"border-orange-500/30 text-neutral-300":"border-orange-400/50 text-neutral-700"}`,children:[u.jsx(Ni,{className:"w-8 h-8 text-orange-500"}),u.jsx("h2",{className:"text-2xl font-black uppercase tracking-widest",children:"Tags & Bridges"})]}),P.map(w=>u.jsxs("div",{className:`p-6 sm:p-8 rounded-3xl border-2 shadow-sm ${r?"bg-neutral-950 border-orange-500/30":"bg-orange-50/50 border-orange-400/30"}`,children:[u.jsxs("div",{className:"flex justify-between items-center mb-6",children:[u.jsx("input",{value:w.name,onChange:y=>No(w.id,y.target.value),placeholder:"Tag Name (e.g. Tag 1)",className:"bg-transparent font-black text-2xl uppercase tracking-tight outline-none flex-1 text-orange-500"}),u.jsx("button",{onClick:()=>{h("delete"),Wt(w.id)},className:"text-red-400 hover:text-red-500 p-2",children:u.jsx(ir,{})})]}),u.jsxs("div",{className:"space-y-6",children:[(w.sections||[]).map(y=>u.jsxs("div",{className:`rounded-3xl border shadow-sm overflow-hidden ${r?"bg-neutral-900 border-neutral-800":"bg-white border-neutral-200"}`,children:[u.jsxs("div",{className:"px-6 py-4 bg-neutral-100/50 dark:bg-neutral-800/50 border-b flex justify-between items-center",children:[u.jsx("input",{value:y.name,onChange:R=>Fr(w.id,y.id,R.target.value),placeholder:"Part Title (Optional)...",className:"bg-transparent font-black uppercase tracking-widest outline-none flex-1 text-sm"}),u.jsx("button",{onClick:()=>{h("delete"),Er(w.id,y.id)},className:"text-neutral-400 hover:text-red-500",children:u.jsx(ir,{className:"w-4 h-4"})})]}),u.jsxs("div",{className:"p-4 sm:p-6 space-y-1",children:[(y.steps||[]).map((R,T)=>u.jsxs(hn.Fragment,{children:[u.jsx(Zo,{clipboard:n,onPaste:()=>Xe(w.id,y.id,T),onHold:($,_)=>v({x:$,y:_,type:"gap",isTag:!0,tagId:w.id,sectionId:y.id,index:T}),dark:r}),u.jsx(Da,{step:R,onUpdate:$=>F(w.id,y.id,R.id,$),onHold:($,_)=>v({x:$,y:_,type:"step",isTag:!0,tagId:w.id,sectionId:y.id,stepId:R.id,index:T}),onRemove:()=>{h("delete"),E(w.id,y.id,R.id)},dark:r})]},R.id)),u.jsx(Zo,{clipboard:n,onPaste:()=>Xe(w.id,y.id,(y.steps||[]).length),onHold:(R,T)=>v({x:R,y:T,type:"gap",isTag:!0,tagId:w.id,sectionId:y.id,index:(y.steps||[]).length}),dark:r}),u.jsxs("div",{className:"flex gap-3 mt-6",children:[u.jsxs("button",{onClick:()=>{h("action"),p({isOpen:!0,isTag:!0,tagId:w.id,sectionId:y.id,predictedFoot:I(),replaceStepId:null})},className:"flex-1 py-3 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-orange-600 transition-colors",children:[u.jsx(za,{className:"w-4 h-4"})," Glossary"]}),u.jsx("button",{onClick:()=>{h("action");const R=y.steps||[],T=R.length>0?R[R.length-1]:null,$=Jo((T==null?void 0:T.count)||"","1",g.type);C(w.id,y.id,R.length,{id:ie(),type:"step",count:$,name:"",description:"",foot:I(),weight:!0})},className:"p-3 bg-orange-200/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors",children:u.jsx(At,{})})]})]})]},y.id)),u.jsxs("button",{onClick:()=>{h("action"),ti(w.id)},className:"w-full py-4 border-2 border-dashed border-orange-500/30 text-orange-500 hover:bg-orange-500/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2",children:[u.jsx(At,{className:"w-4 h-4"})," Add Section to ",w.name||"Tag"]})]})]},w.id))]}),u.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 mt-8",children:[u.jsxs("button",{onClick:()=>{h("action"),Dr()},className:"flex-1 py-6 border-4 border-dashed rounded-3xl text-neutral-400 hover:text-indigo-500 hover:border-indigo-500 transition-all flex flex-col items-center gap-2 font-black uppercase tracking-widest text-sm",children:[u.jsx(At,{className:"w-8 h-8"})," Add Main Section"]}),u.jsxs("button",{onClick:()=>{h("action"),Mt()},className:"flex-1 py-6 border-4 border-dashed rounded-3xl border-orange-500/30 text-orange-500 hover:bg-orange-500/10 transition-all flex flex-col items-center gap-2 font-black uppercase tracking-widest text-sm",children:[u.jsx(Ni,{className:"w-8 h-8"})," Add Tag / Bridge"]})]})]}):e==="preview"?u.jsx(yg,{meta:g,sections:b,tags:P,dark:r}):u.jsx(wg,{dark:r})}),u.jsx("div",{className:"max-w-4xl mx-auto px-3 sm:px-4 pb-10 print:hidden",children:u.jsx(vg,{dark:r})}),m.isOpen&&u.jsx(mg,{onClose:()=>p({...m,isOpen:!1}),predictedFoot:m.predictedFoot,onSelect:(w,y)=>nt(m.isTag,m.tagId,m.sectionId,w,y),dark:r,onActionSound:()=>h("action")})]})}const _a=()=>{const e=document.getElementById("root");e&&ji.createRoot(e).render(u.jsx(hn.StrictMode,{children:u.jsx(kg,{})}))};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_a,{once:!0}):_a();



(function(){
  if (window.__stepperFaviconTransitionInstalled) return;
  window.__stepperFaviconTransitionInstalled = true;

  const GIF_PLAY_MS = 1830;
  const HOLD_MS = 180;
  const FADE_MS = 160;
  const TOTAL_MS = GIF_PLAY_MS + HOLD_MS + FADE_MS;
  const CHANGE_MS = GIF_PLAY_MS;
  const STARTUP_AUDIO_MS = 4064;
  const STARTUP_MS = Math.max(GIF_PLAY_MS + 220, STARTUP_AUDIO_MS + 260);
  const overlayId = 'stepper-snake-transition-overlay';
  const transitionGifSrc = './1000035328.gif';
  const startupSongSrc = './startup-song.m4a';
  let overlay = null;
  let burstHost = null;
  let running = false;
  let startupShown = false;
  let warmGif = null;
  let startupAudio = null;

  function ensureOverlay(){
    if (overlay) return overlay;
    const style = document.createElement('style');
    style.textContent = `
      .stepper-favicon-transition[hidden],
      .stepper-startup-splash[hidden] { display: none !important; }
      .stepper-favicon-transition,
      .stepper-startup-splash {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        pointer-events: none;
        overflow: hidden;
        opacity: 0;
      }
      .stepper-favicon-transition {
        background: #000;
      }
      .stepper-favicon-burst-host {
        position: absolute;
        inset: 0;
      }
      .stepper-favicon-burst {
        position: absolute;
        left: 50%;
        top: 50%;
        width: min(92vmin, 620px);
        height: min(92vmin, 620px);
        object-fit: contain;
        transform: translate(-50%, -50%);
        opacity: 0;
        filter: drop-shadow(0 0 34px rgba(255,170,65,.22));
        will-change: opacity, filter;
      }
      .stepper-favicon-transition.is-running {
        animation: stepperSnakeOverlay ${TOTAL_MS}ms linear forwards;
      }
      .stepper-favicon-transition.is-running .stepper-favicon-burst {
        animation: stepperSnakePresence ${TOTAL_MS}ms linear forwards;
      }
      .stepper-startup-splash {
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100dvh;
        min-height: 100vh;
        background: #000;
        pointer-events: auto;
        opacity: 1;
      }
      .stepper-startup-splash.is-intro {
        opacity: 1;
      }
      .stepper-startup-splash.is-running {
        animation: stepperStartupOverlay ${STARTUP_MS}ms ease forwards;
      }
      .stepper-startup-intro {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: stretch;
        justify-content: center;
        padding: clamp(18px, 3vw, 34px);
        background:
          radial-gradient(circle at 18% 14%, rgba(99,102,241,.22), transparent 30%),
          radial-gradient(circle at 82% 22%, rgba(56,189,248,.14), transparent 24%),
          linear-gradient(180deg, #0d0f17 0%, #050608 58%, #000 100%);
        transition: opacity 200ms ease, transform 200ms ease;
        overflow: hidden;
      }
      .stepper-startup-intro::before,
      .stepper-startup-intro::after {
        content: '';
        position: absolute;
        inset: auto;
        border-radius: 999px;
        pointer-events: none;
        filter: blur(16px);
        opacity: .45;
      }
      .stepper-startup-intro::before {
        width: 38vmax;
        height: 38vmax;
        right: -12vmax;
        top: -10vmax;
        background: radial-gradient(circle, rgba(79,70,229,.35), rgba(79,70,229,0));
      }
      .stepper-startup-intro::after {
        width: 30vmax;
        height: 30vmax;
        left: -8vmax;
        bottom: -10vmax;
        background: radial-gradient(circle, rgba(34,211,238,.2), rgba(34,211,238,0));
      }
      .stepper-startup-splash.is-running .stepper-startup-intro {
        opacity: 0;
        transform: scale(.985);
        pointer-events: none;
      }
      .stepper-startup-shell {
        position: relative;
        z-index: 1;
        width: min(1200px, 100%);
        min-height: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(280px, .92fr);
        gap: clamp(24px, 4vw, 54px);
        align-items: center;
      }
      .stepper-startup-copywrap {
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .stepper-startup-intro-card {
        width: 100%;
        border-radius: 36px;
        padding: clamp(26px, 4vw, 42px);
        background: linear-gradient(180deg, rgba(18,20,28,.84), rgba(10,10,14,.92));
        border: 1px solid rgba(165,180,252,.28);
        box-shadow: 0 30px 100px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07);
        text-align: left;
        color: #fff;
        backdrop-filter: blur(10px);
      }
      .stepper-startup-kicker {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        padding: 10px 14px;
        border-radius: 999px;
        font-size: clamp(11px, 2vw, 13px);
        font-weight: 900;
        letter-spacing: .22em;
        text-transform: uppercase;
        color: rgba(224,231,255,.96);
        background: rgba(99,102,241,.14);
        border: 1px solid rgba(165,180,252,.2);
        width: fit-content;
      }
      .stepper-startup-headline {
        margin: 0;
        font-size: clamp(40px, 7vw, 74px);
        line-height: .92;
        font-weight: 950;
        letter-spacing: -.05em;
        text-wrap: balance;
      }
      .stepper-startup-headline span {
        display: block;
        color: #a5b4fc;
      }
      .stepper-startup-copy {
        margin: 0;
        max-width: 32rem;
        font-size: clamp(15px, 2.5vw, 19px);
        line-height: 1.5;
        color: rgba(255,255,255,.8);
      }
      .stepper-startup-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .stepper-startup-chip {
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.05);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: .04em;
        color: rgba(255,255,255,.9);
      }
      .stepper-startup-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        align-items: center;
        margin-top: 8px;
      }
      .stepper-startup-button {
        min-width: 220px;
        border: 0;
        border-radius: 999px;
        padding: 16px 26px;
        font-size: 16px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #fff;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 48%, #7c3aed 100%);
        box-shadow: 0 20px 44px rgba(79,70,229,.42);
        cursor: pointer;
      }
      .stepper-startup-button:active {
        transform: translateY(1px) scale(.99);
      }
      .stepper-startup-subbutton {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .04em;
        color: rgba(224,231,255,.82);
      }
      .stepper-startup-stage {
        position: relative;
        min-height: min(74vh, 680px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stepper-startup-stage::before {
        content: '';
        position: absolute;
        inset: auto;
        width: min(70vw, 700px);
        height: min(70vw, 700px);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99,102,241,.22) 0%, rgba(99,102,241,.08) 34%, rgba(0,0,0,0) 68%);
        filter: blur(8px);
        opacity: .95;
      }
      .stepper-startup-stage::after {
        content: '';
        position: absolute;
        width: min(60vw, 560px);
        height: min(60vw, 560px);
        border-radius: 50%;
        border: 1px solid rgba(165,180,252,.22);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.03), 0 0 60px rgba(99,102,241,.16);
      }
      .stepper-startup-logo {
        position: relative;
        z-index: 1;
        width: min(84vw, 620px);
        height: min(84vw, 620px);
        max-width: none;
        max-height: none;
        object-fit: contain;
        filter: drop-shadow(0 28px 60px rgba(0,0,0,.42));
        transform: scale(.98);
        opacity: .95;
        will-change: transform, opacity, filter;
      }
      .stepper-startup-splash.is-running .stepper-startup-logo {
        animation: stepperStartupLogo ${STARTUP_MS}ms cubic-bezier(.22,.61,.36,1) forwards;
      }
      @media (max-width: 900px) {
        .stepper-startup-shell {
          grid-template-columns: 1fr;
          gap: 16px;
          align-content: center;
        }
        .stepper-startup-intro-card {
          text-align: center;
        }
        .stepper-startup-kicker,
        .stepper-startup-chip-row,
        .stepper-startup-actions {
          justify-content: center;
          margin-left: auto;
          margin-right: auto;
        }
        .stepper-startup-copy {
          margin-left: auto;
          margin-right: auto;
        }
        .stepper-startup-stage {
          min-height: min(38vh, 360px);
          order: -1;
        }
        .stepper-startup-stage::before { width: min(90vw, 520px); height: min(90vw, 520px); }
        .stepper-startup-stage::after { width: min(78vw, 420px); height: min(78vw, 420px); }
        .stepper-startup-logo { width: min(76vw, 360px); height: min(76vw, 360px); }
      }
      @keyframes stepperSnakeOverlay {
        0% { opacity: 0; }
        2% { opacity: 1; }
        92% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes stepperSnakePresence {
        0% { opacity: 0; filter: drop-shadow(0 0 16px rgba(255,168,64,.16)) brightness(.98) saturate(.98); }
        2% { opacity: 1; filter: drop-shadow(0 0 28px rgba(255,175,70,.24)) brightness(1.02) saturate(1.02); }
        89% { opacity: 1; filter: drop-shadow(0 0 30px rgba(255,175,70,.22)) brightness(1.03) saturate(1.03); }
        100% { opacity: 0; filter: drop-shadow(0 0 16px rgba(255,160,60,.14)) brightness(.96) saturate(.96); }
      }
      @keyframes stepperStartupOverlay {
        0% { opacity: 0; }
        10% { opacity: 1; }
        82% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes stepperStartupLogo {
        0% { opacity: 0; transform: scale(.78); filter: drop-shadow(0 10px 24px rgba(0,0,0,.32)); }
        10% { opacity: 1; transform: scale(.96); filter: drop-shadow(0 18px 42px rgba(0,0,0,.42)); }
        24% { opacity: 1; transform: scale(1); filter: drop-shadow(0 22px 48px rgba(0,0,0,.46)); }
        84% { opacity: 1; transform: scale(1); filter: drop-shadow(0 18px 42px rgba(0,0,0,.42)); }
        100% { opacity: 0; transform: scale(.95); filter: drop-shadow(0 10px 20px rgba(0,0,0,.28)); }
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'stepper-favicon-transition';
    overlay.hidden = true;

    burstHost = document.createElement('div');
    burstHost.className = 'stepper-favicon-burst-host';
    overlay.appendChild(burstHost);

    document.body.appendChild(overlay);
    return overlay;
  }

  function createBurstImage(){
    ensureOverlay();
    burstHost.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'stepper-favicon-burst';
    img.setAttribute('aria-hidden', 'true');
    img.alt = '';
    img.decoding = 'sync';
    img.src = transitionGifSrc;
    burstHost.appendChild(img);
    return img;
  }

  function resetTransitionAnimation(){
    ensureOverlay();
    overlay.classList.remove('is-running');
    burstHost.innerHTML = '';
    void overlay.offsetWidth;
  }

  function prepareTransitionAssets(){
    if (warmGif) return warmGif;
    warmGif = new Image();
    warmGif.decoding = 'async';
    warmGif.src = transitionGifSrc;
    return warmGif;
  }

  function ensureStartupAudio(){
    if (startupAudio) return startupAudio;
    startupAudio = new Audio(startupSongSrc);
    startupAudio.preload = 'auto';
    startupAudio.loop = false;
    startupAudio.volume = 1;
    try { startupAudio.playsInline = true; } catch {}
    return startupAudio;
  }

  function runStartupSplash(){ return; }

  window.__stepperRunFaviconTransition = function(changePage){
    ensureOverlay();
    if (running) return;
    running = true;

    prepareTransitionAssets();
    resetTransitionAnimation();
    createBurstImage();
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('is-running');
      try { if (typeof changePage === 'function') changePage(); } catch (error) { console.error(error); }
    });

    window.setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove('is-running');
      burstHost.innerHTML = '';
      running = false;
    }, TOTAL_MS + 34);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      prepareTransitionAssets();
    }, { once: true });
  } else {
    prepareTransitionAssets();
  }
})();



(function(){
  if (window.__stepperWhatsNewTransitionNoteInstalled) return;
  window.__stepperWhatsNewTransitionNoteInstalled = true;
  const NOTE_TEXT = 'New: the app now opens on a full-screen start page before anything else, then the logo intro and startup music play together once you enter.';
  const noteId = 'stepper-transition-whats-new-note';

  function injectNote(){
    const roots = Array.from(document.querySelectorAll('div, section, article'));
    for (const root of roots) {
      if (root.querySelector && root.querySelector('#' + noteId)) continue;
      const text = (root.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text.includes("What's New")) continue;
      if (!text.includes('startup') && !text.includes('transition')) continue;
      const note = document.createElement('div');
      note.id = noteId;
      note.style.marginBottom = '12px';
      note.style.padding = '12px 14px';
      note.style.borderRadius = '16px';
      note.style.border = '2px solid rgba(99,102,241,.35)';
      note.style.background = 'rgba(99,102,241,.10)';
      note.style.fontWeight = '700';
      note.style.lineHeight = '1.35';
      note.textContent = NOTE_TEXT;
      root.prepend(note);
      return true;
    }
    return false;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (injectNote() || tries > 24) clearInterval(timer);
  }, 750);
})();



(function(){
  if (window.__stepperExtraTabsInstalled) return;
  window.__stepperExtraTabsInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const FEATURED_KEY = 'stepper_featured_dances_v2';
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const SAVE_LATER_KEY = 'stepper_save_for_later_v1';
  const SAVE_LATER_SESSION_KEY = 'stepper_save_for_later_session_v1';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const GOOGLE_FRONTEND_KEY = 'stepper_google_frontend_profile_v1';
  const CLOUD_SAVES_KEY = 'stepper_cloud_saves_frontend_v1';
  const WHATSNEW_PAGE_ID = 'stepper-whatsnew-page';
  const SAVED_PAGE_ID = 'stepper-saved-dances-page';
  const FEATURED_PAGE_ID = 'stepper-featured-choreo-page';
  const INLINE_HOST_ID = 'stepper-editor-inline-host';
  const CHOREO_PANEL_ID = 'stepper-inline-choreography';
  const SETTINGS_PANEL_ID = 'stepper-inline-settings';
  const EXTRA_NOTES = [
    'New: Android dark-mode buttons and black UI strips now keep white text, the B / I / U controls wrap selected text instantly, and page switches now start right when the transition animation kicks off.',
    'New: Featured Choreo now lives in its own tab, stays off the Build page, and the Gmail note moved into that featured space.',
    'Fix: Thinking Music no longer restarts itself every few seconds like a broken jukebox.',
    'Fix: the title screen now fits short phone screens properly instead of dropping below the viewport.',
    'Fix: the page switch GIF now loads properly on Android without the blank image nonsense.',
    'New: Settings and Choreography now sit right above the editor instead of being shoved into extra page-strip tabs.',
    'New: Choreography shows the dances you build with the app on this device, so the saved work is easier to reach.',
    'New: Settings still includes SFX and Thinking Music toggles, now tucked into the editor where they belong.',
    'Fix: Choreography and Settings now show there from startup as well, instead of waiting around like fools.',
    "Just in case: changing font can't be applied. Sorry Bruce Tau but you just got pranked 😛"
  ];
  const sfxFiles = ['light-mode.mp3','dark-mode.mp3','tab-change.wav','ui-action.mp3','open-right-click.mp3','delete.mp3'];
  let activeExtraPage = null;
  let tabStrip = null;
  let buildBtn = null;
  let sheetBtn = null;
  let whatsNewBtn = null;
  let savedDancesBtn = null;
  let featuredBtn = null;
  let settingsBtn = null;
  let dragState = null;
  let mainEl = null;
  let footerWrap = null;
  let host = null;
  let inlineHost = null;
  let thinkingAudio = null;
  let lastSyncedSignature = '';

  function readAppData(){
    try {
      const raw = localStorage.getItem(DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function isDarkMode(){
    const data = readAppData();
    return !!(data && data.isDarkMode);
  }

  function getSettings(){
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return {
        sfxEnabled: saved.sfxEnabled !== false,
        thinkingMusicEnabled: saved.thinkingMusicEnabled === true
      };
    } catch {
      return { sfxEnabled: true, thinkingMusicEnabled: false };
    }
  }

  function saveSettings(settings){
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function readJson(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function iconSpeaker(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  }

  function iconMusic(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle><line x1="5" y1="19" x2="19" y2="5"></line></svg>';
  }

  function iconSparkles(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"></path><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"></path><path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z"></path></svg>';
  }

  function iconShoe(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h5.426a1 1 0 0 1 .863.496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114A4 4 0 0 1 21 14.73V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"></path><path d="m14 13 1-2"></path><path d="M8 18v-1a4 4 0 0 0-4-4H3"></path><path d="m10 12 1.5-3"></path></svg>';
  }

  function iconCog(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.4a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.97 4.1a1.7 1.7 0 0 0 1.03-1.56V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"></path></svg>';
  }

  function iconCloud(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0-.62-8.96A6 6 0 0 0 5 11a4 4 0 0 0 0 8h12.5Z"></path></svg>';
  }

  function iconFolder(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path></svg>';
  }

  function iconGoogle(){
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24"><path fill="#ff808c" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m20.0157 4.47237 -2.7835 2.62086c-0.7631 -0.81506 -1.7062 -1.44047 -2.754 -1.82632 -1.0477 -0.38585 -2.1712 -0.52146 -3.2807 -0.39602 -1.1095 0.12544 -2.17428 0.50848 -3.10944 1.11853 -0.93517 0.61005 -1.7148 1.43024 -2.27669 2.39511l-3.01303 -2.3913c0.90798 -1.39584 2.12153 -2.56691 3.54884 -3.42459 1.4273 -0.85768 3.03097 -1.37953 4.68972 -1.52605 1.6587 -0.146517 3.329 0.08612 4.8846 0.68032 1.5555 0.5942 2.9556 1.5344 4.0942 2.74946Z" stroke-width="1"></path><path fill="#ffef5e" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m5.8496 15.6732 -2.87912 2.5922c-1.2527 -1.7938 -1.93871 -3.922 -1.9694 -6.1097 -0.030695 -2.18766 0.59534 -4.33427 1.79723 -6.16247l3.01303 2.39129c-0.65148 1.10544 -0.99188 2.36648 -0.98514 3.64958 0.00674 1.2831 0.36035 2.5406 1.0234 3.6391Z" stroke-width="1"></path><path fill="#78eb7b" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M18.8298 20.6376c-1.1798 0.9299 -2.5374 1.6084 -3.9893 1.9939 -1.4519 0.3854 -2.9673 0.4696 -4.4529 0.2474 -1.48566 -0.2222 -2.9101 -0.7462 -4.18565 -1.5396 -1.27554 -0.7934 -2.37519 -1.8395 -3.23125 -3.0739l2.87912 -2.5921c0.51308 0.8604 1.20068 1.6039 2.01853 2.1825 0.81785 0.5785 1.74782 0.9794 2.73005 1.1767 0.9821 0.1974 1.9948 0.1868 2.9726 -0.031 0.9779 -0.2178 1.8993 -0.6379 2.7049 -1.2334l2.5539 2.8695Z" stroke-width="1"></path><path fill="#66e1ff" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M22.9998 10.5654v2.0087c-0.0814 1.5634 -0.4954 3.0915 -1.2146 4.482 -0.7192 1.3906 -1.727 2.6116 -2.9559 3.5815l-2.5539 -2.8696c1.1579 -0.8459 2.0317 -2.0233 2.5061 -3.3765h-5.3469v-3.8261h9.5652Z" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m2.79857 5.9937 -0.01 -0.01" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m2.97045 18.2654 -0.01 0.01" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m5.85961 15.6637 -0.01 0.01" stroke-width="1"></path></svg>`;
  }

  function ensureAudioPatch(){
    if (window.__stepperAudioSettingsPatched) return;
    window.__stepperAudioSettingsPatched = true;
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(){
      try {
        const src = (this.currentSrc || this.src || '').toLowerCase();
        const settings = getSettings();
        if (!settings.sfxEnabled && sfxFiles.some(file => src.includes(file))) {
          return Promise.resolve();
        }
      } catch {}
      return originalPlay.apply(this, arguments);
    };
  }

  function createAudioElement(sources){
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    try { audio.playsInline = true; } catch {}
    (Array.isArray(sources) ? sources : [sources]).forEach((src) => {
      const source = document.createElement('source');
      source.src = src;
      if (src.endsWith('.mp3')) source.type = 'audio/mpeg';
      else if (src.endsWith('.m4a')) source.type = 'audio/mp4';
      else if (src.endsWith('.wav')) source.type = 'audio/wav';
      audio.appendChild(source);
    });
    return audio;
  }

  function applyThinkingMusic(restart = false){
    const settings = getSettings();
    if (!thinkingAudio) {
      thinkingAudio = createAudioElement(['./thinking-music.mp3','./thinking-music.wav']);
      thinkingAudio.loop = true;
      thinkingAudio.volume = 0.55;
    }
    if (settings.thinkingMusicEnabled) {
      try {
        if (restart) {
          thinkingAudio.pause();
          thinkingAudio.currentTime = 0;
        }
        if (thinkingAudio.paused) {
          const playPromise = thinkingAudio.play();
          if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
        }
      } catch {}
    } else {
      try {
        thinkingAudio.pause();
        thinkingAudio.currentTime = 0;
      } catch {}
    }
  }

  function saveFeaturedSnapshot(){
    const data = readAppData();
    if (!data || !data.meta) return;
    const meta = data.meta || {};
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    const hasContent = title || choreographer || sections.some(section => Array.isArray(section.steps) && section.steps.some(step => step && (step.name || step.description)));
    if (!hasContent) return;
    const signature = JSON.stringify({meta, sections, tags});
    if (signature === lastSyncedSignature) return;
    lastSyncedSignature = signature;

    let featured = [];
    try {
      featured = JSON.parse(localStorage.getItem(FEATURED_KEY) || '[]');
      if (!Array.isArray(featured)) featured = [];
    } catch {
      featured = [];
    }

    const id = (title || 'untitled').toLowerCase() + '|' + (choreographer || 'unknown').toLowerCase();
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    const entry = {
      id,
      title: title || 'Untitled Dance',
      choreographer: choreographer || 'Uncredited',
      country: String(meta.country || '').trim(),
      level: String(meta.level || '').trim() || 'Unlabelled',
      counts: String(meta.counts || '').trim() || '-',
      walls: String(meta.walls || '').trim() || '-',
      music: String(meta.music || '').trim(),
      sections: sections.length,
      tags: tags.length,
      steps: stepCount,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = featured.findIndex(item => item && item.id === id);
    if (existingIndex >= 0) featured[existingIndex] = entry;
    else featured.unshift(entry);

    featured.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    featured = featured.slice(0, 120);
    localStorage.setItem(FEATURED_KEY, JSON.stringify(featured));
    renderExtraPages();
  }

  function getFeaturedDances(){
    try {
      const featured = JSON.parse(localStorage.getItem(FEATURED_KEY) || '[]');
      return Array.isArray(featured) ? featured : [];
    } catch {
      return [];
    }
  }

  function ensureHost(){
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stepper-extra-page-host';
    host.hidden = true;
    host.className = 'max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 sm:pb-32 print:hidden';
    host.innerHTML = `<div class="space-y-5"><section id="${SAVED_PAGE_ID}" hidden></section><section id="${FEATURED_PAGE_ID}" hidden></section><section id="${WHATSNEW_PAGE_ID}" hidden></section></div>`;
    if (mainEl && mainEl.parentNode) {
      mainEl.parentNode.insertBefore(host, footerWrap || mainEl.nextSibling);
    } else {
      document.body.appendChild(host);
    }
    return host;
  }

  function ensureInlineHost(){
    if (inlineHost) return inlineHost;
    inlineHost = document.createElement('div');
    inlineHost.id = INLINE_HOST_ID;
    inlineHost.hidden = true;
    inlineHost.className = 'max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-0 print:hidden';
    inlineHost.innerHTML = `<div class="space-y-5"><section id="${CHOREO_PANEL_ID}"></section><section id="${SETTINGS_PANEL_ID}"></section></div>`;
    if (mainEl && mainEl.parentNode) {
      mainEl.parentNode.insertBefore(inlineHost, mainEl);
    } else {
      document.body.appendChild(inlineHost);
    }
    return inlineHost;
  }

  function themeClasses(){
    const dark = isDarkMode();
    return {
      dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      button: dark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500'
    };
  }

  function formatDate(iso){
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return 'Recently';
    }
  }

  function buildFeaturedSubmissionEntry(source){
    const fallback = { title:'Untitled Dance', choreographer:'Uncredited', country:'', level:'Unlabelled', counts:'-', walls:'-', music:'', sections:0, steps:0, updatedAt:new Date().toISOString() };
    if (!source) return fallback;
    return {
      title: String(source.title || source.meta?.title || fallback.title).trim() || fallback.title,
      choreographer: String(source.choreographer || source.meta?.choreographer || fallback.choreographer).trim() || fallback.choreographer,
      country: String(source.country || source.meta?.country || '').trim(),
      level: String(source.level || source.meta?.level || fallback.level).trim() || fallback.level,
      counts: String(source.counts || source.meta?.counts || fallback.counts).trim() || fallback.counts,
      walls: String(source.walls || source.meta?.walls || fallback.walls).trim() || fallback.walls,
      music: String(source.music || source.meta?.music || '').trim(),
      sections: Number(source.sections || 0) || 0,
      steps: Number(source.steps || 0) || 0,
      updatedAt: source.updatedAt || new Date().toISOString()
    };
  }

  function getCurrentDanceEntry(){
    const data = readAppData();
    if (!data || !data.meta) return null;
    const meta = data.meta || {};
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    if (!(title || choreographer || stepCount > 0)) return null;
    return buildFeaturedSubmissionEntry({ meta, title, choreographer, country:String(meta.country || '').trim(), level:String(meta.level || '').trim(), counts:String(meta.counts || '').trim(), walls:String(meta.walls || '').trim(), music:String(meta.music || '').trim(), sections:sections.length, steps:stepCount, updatedAt:new Date().toISOString() });
  }

  function buildFeaturedSubmissionLink(source){
    const entry = buildFeaturedSubmissionEntry(source || getCurrentDanceEntry() || getFeaturedDances()[0] || null);
    const subject = `Step by Stepper Featured Dance Submission – ${entry.title}`;
    const body = [
      'Hello,',
      '',
      'I would like to submit this dance for the Featured Dances section in Step by Stepper.',
      '',
      `Dance Title: ${entry.title}`,
      `Choreographer: ${entry.choreographer}`,
      `Country: ${entry.country || '-'}`,
      `Level: ${entry.level}`,
      `Counts: ${entry.counts}`,
      `Walls: ${entry.walls}`,
      `Sections: ${entry.sections || '-'}`,
      `Steps: ${entry.steps || '-'}`,
      `Music: ${entry.music || '-'}`,
      '',
      'Please review it for featuring.',
      '',
      'Sent from Step by Stepper.'
    ].join('\n');
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function getFeaturedDances(){
    const featured = readJson(FEATURED_KEY, []);
    return Array.isArray(featured) ? featured : [];
  }

  function getGoogleFrontendProfile(){
    const profile = readJson(GOOGLE_FRONTEND_KEY, null);
    if (!profile || typeof profile !== 'object') return null;
    const email = String(profile.email || '').trim();
    if (!email) return null;
    const name = String(profile.name || '').trim() || email.split('@')[0];
    return { name, email, updatedAt: profile.updatedAt || new Date().toISOString() };
  }

  function getActiveCloudProfile(){
    const profile = getGoogleFrontendProfile();
    if (profile && profile.email) return profile;
    return { name: 'This device', email: 'device@stepbystepper.local', updatedAt: new Date().toISOString(), localOnly: true };
  }

  function saveGoogleFrontendProfile(profile){
    writeJson(GOOGLE_FRONTEND_KEY, {
      name: String(profile && profile.name || '').trim(),
      email: String(profile && profile.email || '').trim(),
      updatedAt: new Date().toISOString()
    });
  }

  function clearGoogleFrontendProfile(){
    localStorage.removeItem(GOOGLE_FRONTEND_KEY);
  }

  function getCloudSaveMap(){
    const payload = readJson(CLOUD_SAVES_KEY, {});
    return payload && typeof payload === 'object' ? payload : {};
  }

  function saveCloudSaveMap(payload){
    writeJson(CLOUD_SAVES_KEY, payload || {});
  }

  function currentDanceIdentity(data){
    const meta = data && data.meta ? data.meta : {};
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    return {
      id: (title || 'untitled').toLowerCase() + '|' + (choreographer || 'unknown').toLowerCase(),
      title: title || 'Untitled Dance',
      choreographer: choreographer || 'Uncredited'
    };
  }

  function hasDanceContent(data){
    if (!data || !data.meta) return false;
    const identity = currentDanceIdentity(data);
    const sections = Array.isArray(data.sections) ? data.sections : [];
    return !!(identity.title !== 'Untitled Dance' || identity.choreographer !== 'Uncredited' || sections.some(section => Array.isArray(section && section.steps) && section.steps.length));
  }

  function buildLocalSnapshotEntry(data){
    const identity = currentDanceIdentity(data || {});
    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    return {
      id: identity.id,
      title: identity.title,
      choreographer: identity.choreographer,
      country: String((data && data.meta && data.meta.country) || '').trim(),
      level: String((data && data.meta && data.meta.level) || 'Unlabelled').trim() || 'Unlabelled',
      counts: String((data && data.meta && data.meta.counts) || '-').trim() || '-',
      walls: String((data && data.meta && data.meta.walls) || '-').trim() || '-',
      music: String((data && data.meta && data.meta.music) || '').trim(),
      sections: sections.length,
      steps: stepCount,
      updatedAt: new Date().toISOString(),
      snapshot: {
        data: JSON.parse(JSON.stringify(data || {})),
        phrasedTools: readJson(PHR_TOOLS_KEY, {})
      }
    };
  }

  function getCloudEntriesForProfile(profile){
    if (!profile || !profile.email) return [];
    const map = getCloudSaveMap();
    const list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
    return list.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }

  function loadSnapshotEntry(entry){
    if (!entry || !entry.snapshot) return;
    const snapshotData = entry.snapshot.data || entry.snapshot;
    writeJson(DATA_KEY, snapshotData);
    writeJson(PHR_TOOLS_KEY, entry.snapshot.phrasedTools || {});
    location.reload();
  }

  function deleteLocalSavedDance(id){
    const featured = getFeaturedDances().filter(item => item && item.id !== id);
    writeJson(FEATURED_KEY, featured);
  }

  function saveCurrentDanceToCloud(){
    const profile = getActiveCloudProfile();
    const data = readAppData();
    if (!hasDanceContent(data)) {
      alert('Build a dance first, then save it to the cloud front end.');
      return false;
    }
    const entry = buildLocalSnapshotEntry(data);
    const map = getCloudSaveMap();
    let list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
    const existingIndex = list.findIndex(item => item && item.id === entry.id);
    if (existingIndex >= 0) list[existingIndex] = Object.assign({}, list[existingIndex], entry);
    else list.unshift(entry);
    list = list.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 120);
    map[profile.email] = list;
    saveCloudSaveMap(map);
    return true;
  }

  function deleteCloudDance(profile, id){
    if (!profile || !profile.email) return;
    const map = getCloudSaveMap();
    const list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
    map[profile.email] = list.filter(item => item && item.id !== id);
    saveCloudSaveMap(map);
  }

  function renderSavedDancesPage(){
    const page = document.getElementById(SAVED_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    const profile = getActiveCloudProfile();
    const localDances = getFeaturedDances();
    const cloudDances = getCloudEntriesForProfile(profile);
    const cloudShelfCard = `
      <div class="rounded-2xl border p-5 sm:p-6 ${theme.panel}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <span class="stepper-extra-tab-icon">${iconCloud()}</span>
              <div>
                <div class="text-lg font-black tracking-tight">Cloud save shelf</div>
                <p class="mt-1 text-sm ${theme.subtle}">Attached to ${escapeHtml(profile.name)}</p>
              </div>
            </div>
            <p class="mt-4 text-sm leading-relaxed ${theme.subtle}">This front-end shelf keeps cloud-style saves grouped on this device, so saved dances stay in one place even without a live backend yet.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button type="button" data-action="save-current-cloud" class="stepper-mini-btn ${theme.orange}">Save current dance to cloud</button>
          </div>
        </div>
      </div>`;

    const localCards = localDances.length ? localDances.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-local-dance-id="${escapeHtml(item.id)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">On this device</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" data-action="load-local" class="stepper-mini-btn ${theme.button}">Load</button>
          <button type="button" data-action="delete-local" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Delete</button>
          <button type="button" data-action="push-local-cloud" class="stepper-mini-btn ${theme.orange}">Push to cloud</button>
          <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Updated ${escapeHtml(formatDate(item.updatedAt))}</span>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-bold">No saved dances yet.</p><p class="mt-2 ${theme.subtle}">Step by Stepper already remembers what people make on this device. Once a dance has a title or a few steps, it will show up here automatically.</p></div>`;

    const cloudCards = cloudDances.length ? cloudDances.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-cloud-dance-id="${escapeHtml(item.id)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-emerald-900/40 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}">Cloud front end</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" data-action="load-cloud" class="stepper-mini-btn ${theme.button}">Load</button>
          <button type="button" data-action="delete-cloud" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Delete</button>
          <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Saved ${escapeHtml(formatDate(item.updatedAt))}</span>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-bold">No cloud saves yet.</p><p class="mt-2 ${theme.subtle}">Use the cloud button above or push one of your saved dances up into the cloud shelf.</p></div>`;

    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconFolder()}</span> My Saved Dances</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        ${cloudShelfCard}
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <div class="flex items-center gap-3">
            <span class="stepper-extra-tab-icon">${iconCloud()}</span>
            <div>
              <div class="text-lg font-black tracking-tight">Cloud save front end</div>
              <p class="mt-1 text-sm ${theme.subtle}">This shell is ready for a real Google/cloud backend later. Right now it still behaves usefully by remembering your saved dances on this device and giving them a simple cloud-style shelf until a real backend exists.</p>
            </div>
          </div>
        </div>
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <h3 class="text-lg font-black uppercase tracking-widest">Saved on this device</h3>
            <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">${localDances.length} saved</span>
          </div>
          ${localCards}
        </section>
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <h3 class="text-lg font-black uppercase tracking-widest">Cloud saves</h3>
            <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">${cloudDances.length} saved</span>
          </div>
          ${cloudCards}
        </section>
      </div>
    `;

    const saveCurrentBtn = page.querySelector('[data-action="save-current-cloud"]');
    if (saveCurrentBtn) saveCurrentBtn.addEventListener('click', () => {
      if (saveCurrentDanceToCloud()) renderSavedDancesPage();
    });

    page.querySelectorAll('[data-local-dance-id]').forEach(card => {
      const id = card.getAttribute('data-local-dance-id');
      const entry = localDances.find(item => item && item.id === id);
      const loadBtn = card.querySelector('[data-action="load-local"]');
      const deleteBtn = card.querySelector('[data-action="delete-local"]');
      const pushBtn = card.querySelector('[data-action="push-local-cloud"]');
      if (loadBtn) loadBtn.addEventListener('click', () => loadSnapshotEntry(entry));
      if (deleteBtn) deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete saved dance "${(entry && entry.title) || 'this dance'}" from this device?`)) {
          deleteLocalSavedDance(id);
          renderSavedDancesPage();
        }
      });
      if (pushBtn) pushBtn.addEventListener('click', () => {
        const profile = getActiveCloudProfile();
        const map = getCloudSaveMap();
        let list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
        const existingIndex = list.findIndex(item => item && item.id === id);
        if (existingIndex >= 0) list[existingIndex] = Object.assign({}, list[existingIndex], entry, { updatedAt: new Date().toISOString() });
        else list.unshift(Object.assign({}, entry, { updatedAt: new Date().toISOString() }));
        map[profile.email] = list.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 120);
        saveCloudSaveMap(map);
        renderSavedDancesPage();
      });
    });

    page.querySelectorAll('[data-cloud-dance-id]').forEach(card => {
      const id = card.getAttribute('data-cloud-dance-id');
      const entry = cloudDances.find(item => item && item.id === id);
      const loadBtn = card.querySelector('[data-action="load-cloud"]');
      const deleteBtn = card.querySelector('[data-action="delete-cloud"]');
      if (loadBtn) loadBtn.addEventListener('click', () => loadSnapshotEntry(entry));
      if (deleteBtn) deleteBtn.addEventListener('click', () => {
        if (!profile) return;
        if (confirm(`Delete cloud save "${(entry && entry.title) || 'this dance'}"?`)) {
          deleteCloudDance(profile, id);
          renderSavedDancesPage();
        }
      });
    });
  }

  function renderWhatsNewPage(){
    const page = document.getElementById(WHATSNEW_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    const cards = EXTRA_NOTES.map((note, index) => {
      const icon = index === 2 ? iconSparkles() : index === 3 ? iconCog() : iconMusic(true);
      return `
        <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
          <div class="flex items-start gap-3">
            <span class="stepper-extra-tab-icon mt-0.5 shrink-0">${icon}</span>
            <p class="font-medium leading-relaxed">${escapeHtml(note)}</p>
          </div>
        </article>
      `;
    }).join('');
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconMusic(true)}</span> What's New</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        ${cards}
      </div>
    `;
  }

  function renderChoreographyPanel(targetId){
    const page = document.getElementById(targetId);
    if (!page) return;
    if (targetId === CHOREO_PANEL_ID) {
      page.innerHTML = '';
      page.className = '';
      page.hidden = true;
      return;
    }
    const featured = getFeaturedDances();
    const theme = themeClasses();
    const cards = featured.length ? featured.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-featured-dance-id="${escapeHtml(item.id)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title)}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer)}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
          </div>
          <span class="shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(item.level)}</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections))}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps))}</div></div>
        </div>
        ${item.music ? `<p class="mt-4 text-sm leading-relaxed ${theme.subtle}"><strong class="${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">Music:</strong> ${escapeHtml(item.music)}</p>` : ''}
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" data-action="load-featured" class="stepper-mini-btn ${theme.button}">Load</button>
          <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Updated ${escapeHtml(formatDate(item.updatedAt))}</span>
        </div>
      </article>
    `).join('') : `
      <div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}">
        <p class="text-lg font-bold">No choreography's Featured yet</p>
      </div>
    `;
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.hidden = false;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconShoe()}</span> Featured Choreo</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <p class="text-base sm:text-lg font-bold leading-relaxed">Featured dancers are best of the best for flowability. Send a PDF Via Gmail at <a href="mailto:anthonytau4@gmail.com" class="underline ${theme.dark ? 'text-orange-300' : 'text-orange-600'}">anthonytau4@gmail.com</a></p>
        </div>
        ${cards}
      </div>
    `;
    page.querySelectorAll('[data-featured-dance-id]').forEach(card => {
      const id = card.getAttribute('data-featured-dance-id');
      const item = featured.find(entry => entry && entry.id === id);
      const loadBtn = card.querySelector('[data-action="load-featured"]');
      if (loadBtn) loadBtn.addEventListener('click', () => loadSavedDance(id));
    });
  }

  function renderSettingsPanel(targetId){
    const page = document.getElementById(targetId);
    if (!page) return;
    const theme = themeClasses();
    const settings = getSettings();
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconCog()}</span> Settings</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <button type="button" data-stepper-setting="sfx" class="stepper-setting-toggle rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div class="min-w-0">
            <div class="text-lg font-black tracking-tight">SFX Sounds</div>
            <p class="mt-1 text-sm ${theme.subtle}">Menu clicks, tab changes, dark mode toggles and other little UI noises.</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="stepper-setting-icon ${settings.sfxEnabled ? 'is-on' : 'is-off'}">${iconSpeaker(settings.sfxEnabled)}</span>
            <span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.sfxEnabled ? 'On' : 'Off'}</span>
          </div>
        </button>
        <button type="button" data-stepper-setting="thinking" class="stepper-setting-toggle rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div class="min-w-0">
            <div class="text-lg font-black tracking-tight">Thinking Music</div>
            <p class="mt-1 text-sm ${theme.subtle}">Loops the lobby track while you work. Starts off, because mercy still exists.</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="stepper-setting-icon ${settings.thinkingMusicEnabled ? 'is-on' : 'is-off'}">${iconMusic(settings.thinkingMusicEnabled)}</span>
            <span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.thinkingMusicEnabled ? 'On' : 'Off'}</span>
          </div>
        </button>
      </div>
    `;
    page.querySelector('[data-stepper-setting="sfx"]').addEventListener('click', () => {
      const current = getSettings();
      current.sfxEnabled = !current.sfxEnabled;
      saveSettings(current);
      renderSettingsPanel(targetId);
    });
    page.querySelector('[data-stepper-setting="thinking"]').addEventListener('click', () => {
      const current = getSettings();
      current.thinkingMusicEnabled = !current.thinkingMusicEnabled;
      saveSettings(current);
      applyThinkingMusic(current.thinkingMusicEnabled);
      renderSettingsPanel(targetId);
    });
  }

  function isEditorSurfaceVisible(){
    if (!mainEl || activeExtraPage) return false;
    if (mainEl.style.display === 'none') return false;
    const text = (mainEl.textContent || '').replace(/\s+/g, ' ');
    return text.includes('Dance Title') && text.includes('Choreographer') && text.includes('Country');
  }

  function syncInlineHostVisibility(){
    ensureInlineHost();
    inlineHost.hidden = !isEditorSurfaceVisible();
  }

  function renderInlineEditorPanels(){
    ensureInlineHost();
    renderChoreographyPanel(CHOREO_PANEL_ID);
    renderSettingsPanel(SETTINGS_PANEL_ID);
    syncInlineHostVisibility();
  }

  function renderExtraPages(){
    if (!mainEl || !tabStrip) return;
    ensureHost();
    renderSavedDancesPage();
    renderChoreographyPanel(FEATURED_PAGE_ID);
    renderWhatsNewPage();
    renderInlineEditorPanels();
    updateButtonState();
  }

  function setActiveExtra(pageName){
    activeExtraPage = pageName === 'whatsnew' ? 'whatsnew' : pageName === 'saveddances' ? 'saveddances' : pageName === 'featured' ? 'featured' : null;
    ensureHost();
    const whatsNewPage = document.getElementById(WHATSNEW_PAGE_ID);
    const savedPage = document.getElementById(SAVED_PAGE_ID);
    const featuredPage = document.getElementById(FEATURED_PAGE_ID);
    if (!activeExtraPage) {
      host.hidden = true;
      if (mainEl) mainEl.style.display = '';
      if (footerWrap) footerWrap.style.display = '';
      if (whatsNewPage) whatsNewPage.hidden = true;
      if (savedPage) savedPage.hidden = true;
      if (featuredPage) featuredPage.hidden = true;
    } else {
      renderExtraPages();
      host.hidden = false;
      if (mainEl) mainEl.style.display = 'none';
      if (footerWrap) footerWrap.style.display = 'none';
      if (whatsNewPage) whatsNewPage.hidden = activeExtraPage !== 'whatsnew';
      if (savedPage) savedPage.hidden = activeExtraPage !== 'saveddances';
      if (featuredPage) featuredPage.hidden = activeExtraPage !== 'featured';
      host.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    syncInlineHostVisibility();
    updateButtonState();
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function scrollButtonIntoView(button){
    if (!button || typeof button.scrollIntoView !== 'function') return;
    try {
      button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch {}
  }

  function openExtraPage(pageName, button){
    scrollButtonIntoView(button);
    const openPage = () => setActiveExtra(pageName);
    if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(openPage);
    else openPage();
  }

  function makeExtraButton(label, iconSvg, pageName){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'stepper-extra-tab shrink-0 px-2.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap opacity-50 hover:opacity-100';
    btn.innerHTML = `<span class="stepper-extra-tab-icon">${iconSvg}</span><span>${escapeHtml(label)}</span>`;
    btn.addEventListener('click', () => {
      openExtraPage(pageName, btn);
    });
    return btn;
  }

  function updateButtonState(){
    const dark = isDarkMode();
    const applyTabStyles = (button, isActive, accentColor) => {
      if (!button) return;
      button.style.color = dark ? '#ffffff' : '';
      button.style.opacity = isActive ? '1' : (dark ? '.92' : '');
      button.style.transform = isActive ? 'translateY(-1px)' : '';
      button.style.boxShadow = isActive ? '0 8px 24px rgba(79,70,229,.18)' : '';
      button.style.background = isActive ? (dark ? '#2f2f2f' : '#ffffff') : '';
      button.style.borderColor = isActive ? (dark ? '#525252' : '#d4d4d8') : '';
      if (!dark && isActive && accentColor) button.style.color = accentColor;
    };
    if (tabStrip) tabStrip.style.color = dark ? '#ffffff' : '';
    applyTabStyles(buildBtn, !activeExtraPage, '#4f46e5');
    applyTabStyles(sheetBtn, !activeExtraPage && !!document.querySelector('main'), '#4f46e5');
    if (whatsNewBtn) {
      whatsNewBtn.dataset.stepperOwnPage = 'true';
      applyTabStyles(whatsNewBtn, activeExtraPage === 'whatsnew', '#4f46e5');
    }
    if (savedDancesBtn) {
      savedDancesBtn.dataset.stepperOwnPage = 'true';
      applyTabStyles(savedDancesBtn, activeExtraPage === 'saveddances', '#4f46e5');
    }
    if (featuredBtn) {
      featuredBtn.dataset.stepperOwnPage = 'true';
      applyTabStyles(featuredBtn, activeExtraPage === 'featured', '#4f46e5');
    }
  }

  function injectStyles(){
    if (document.getElementById('stepper-extra-tabs-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-extra-tabs-style';
    style.textContent = `
      .stepper-extra-tab-icon,
      .stepper-setting-icon { display:inline-flex; align-items:center; justify-content:center; width:1.4rem; height:1.4rem; }
      .stepper-extra-tab-icon svg,
      .stepper-setting-icon svg { width:100%; height:100%; }
      .stepper-setting-icon.is-on { color:#4f46e5; }
      .stepper-setting-icon.is-off { color:#737373; }
      .stepper-setting-toggle { transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
      .stepper-setting-toggle:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(0,0,0,.08); }
      .dark .stepper-extra-tab,
      .dark .stepper-extra-tab span,
      .dark .stepper-extra-tab-icon,
      .dark .stepper-extra-tab-icon svg,
      .dark .stepper-tools-tab,
      .dark .stepper-tools-tab span,
      .dark .stepper-tools-tab svg,
      .dark .stepper-font-choice,
      .dark .stepper-font-choice strong,
      .dark .stepper-font-choice span,
      .dark .stepper-setting-toggle,
      .dark .stepper-setting-toggle span,
      .dark .stepper-help-panel,
      .dark .stepper-help-panel * { color:#f5f5f5 !important; }
      .dark .stepper-extra-tab-icon svg,
      .dark .stepper-setting-icon svg,
      .dark .stepper-tools-tab svg { stroke: currentColor; }
      #stepper-extra-page-host,
      #${INLINE_HOST_ID} { width: 100%; }
      #${INLINE_HOST_ID} section + section { margin-top: 1.25rem; }
    `;
    document.head.appendChild(style);
  }

  function injectWhatsNewNotes(){
    const ownPage = document.getElementById(WHATSNEW_PAGE_ID);
    const candidates = ownPage ? [ownPage] : Array.from(document.querySelectorAll('section, div, article'));
    const target = candidates.find(node => (node.textContent || '').includes("What's New"));
    if (!target) return false;
    EXTRA_NOTES.forEach((note, index) => {
      const id = `stepper-extra-note-${index}`;
      if (target.querySelector('#' + id)) return;
      const theme = themeClasses();
      const noteEl = document.createElement('div');
      noteEl.id = id;
      noteEl.className = `rounded-2xl border px-4 py-4 flex gap-3 ${theme.soft}`;
      noteEl.innerHTML = `<div class="mt-0.5 shrink-0"><span class="stepper-extra-tab-icon">${index === 1 ? iconSparkles() : index === 2 ? iconCog() : iconMusic(true)}</span></div><p class="font-medium leading-relaxed">${escapeHtml(note)}</p>`;
      const list = target.querySelector('.space-y-3') || target;
      list.prepend(noteEl);
    });
    return true;
  }

  function wireStripDragScroll(){
    if (!tabStrip || tabStrip.__stepperDragScrollWired) return;
    tabStrip.__stepperDragScrollWired = true;

    tabStrip.addEventListener('touchstart', (event) => {
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      dragState = { x: touch.clientX, y: touch.clientY, left: tabStrip.scrollLeft, horizontal: false };
    }, { passive: true });

    tabStrip.addEventListener('touchmove', (event) => {
      if (!dragState) return;
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - dragState.x;
      const dy = touch.clientY - dragState.y;
      if (!dragState.horizontal && Math.abs(dx) > Math.abs(dy) + 6) dragState.horizontal = true;
      if (!dragState.horizontal) return;
      tabStrip.scrollLeft = dragState.left - dx;
      event.preventDefault();
    }, { passive: false });

    const clearDrag = () => { dragState = null; };
    tabStrip.addEventListener('touchend', clearDrag, { passive: true });
    tabStrip.addEventListener('touchcancel', clearDrag, { passive: true });
  }

  function wireNativeTabClose(){
    if (!tabStrip || tabStrip.__stepperExtraWired) return;
    tabStrip.__stepperExtraWired = true;
    tabStrip.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const text = (button.textContent || '').trim();
      if (/^Build$|^Sheet$/.test(text) && activeExtraPage) {
        setActiveExtra(null);
      }
    }, true);
  }

  function locateUi(){
    buildBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Build') || null;
    sheetBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Sheet') || null;
    whatsNewBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === "What's New") || null;
    tabStrip = buildBtn ? buildBtn.parentElement : null;
    mainEl = document.querySelector('main');
    footerWrap = mainEl && mainEl.parentElement ? Array.from(mainEl.parentElement.querySelectorAll('div')).find(node => { const cls = node.className || ''; return typeof cls === 'string' && cls.includes('max-w-4xl') && cls.includes('mx-auto') && cls.includes('px-3') && cls.includes('pb-10'); }) || null : null;
    if (!tabStrip || !mainEl) return false;
    tabStrip.classList.remove('stepper-tab-strip-scroll');
    tabStrip.style.maxWidth = '';
    tabStrip.style.width = '';
    tabStrip.style.paddingRight = '';
    tabStrip.style.gap = '';
    if (tabStrip.parentElement) tabStrip.parentElement.style.minWidth = '0';
    if (buildBtn && !buildBtn.__stepperScrollWired) {
      buildBtn.__stepperScrollWired = true;
      buildBtn.addEventListener('click', () => scrollButtonIntoView(buildBtn));
    }
    if (sheetBtn && !sheetBtn.__stepperScrollWired) {
      sheetBtn.__stepperScrollWired = true;
      sheetBtn.addEventListener('click', () => scrollButtonIntoView(sheetBtn));
    }
    if (whatsNewBtn && !whatsNewBtn.__stepperOwnPageWired) {
      whatsNewBtn.__stepperOwnPageWired = true;
      whatsNewBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        openExtraPage('whatsnew', whatsNewBtn);
      }, true);
    }
    savedDancesBtn = document.getElementById('stepper-saved-dances-tab');
    if (!savedDancesBtn) {
      savedDancesBtn = makeExtraButton('My Saved Dances', iconFolder(), 'saveddances');
      savedDancesBtn.id = 'stepper-saved-dances-tab';
      if (whatsNewBtn && whatsNewBtn.parentNode === tabStrip) whatsNewBtn.insertAdjacentElement('afterend', savedDancesBtn);
      else tabStrip.appendChild(savedDancesBtn);
    }
    featuredBtn = document.getElementById('stepper-featured-choreo-tab');
    if (!featuredBtn) {
      featuredBtn = makeExtraButton('Featured Choreo', iconShoe(), 'featured');
      featuredBtn.id = 'stepper-featured-choreo-tab';
      if (savedDancesBtn && savedDancesBtn.parentNode === tabStrip) savedDancesBtn.insertAdjacentElement('afterend', featuredBtn);
      else if (whatsNewBtn && whatsNewBtn.parentNode === tabStrip) whatsNewBtn.insertAdjacentElement('afterend', featuredBtn);
      else tabStrip.appendChild(featuredBtn);
    }
    if (settingsBtn && settingsBtn.parentNode) settingsBtn.remove();
    settingsBtn = null;
    ensureHost();
    ensureInlineHost();
    wireNativeTabClose();
    renderExtraPages();
    return true;
  }

  function boot(){
    injectStyles();
    ensureAudioPatch();
    applyThinkingMusic();
    saveFeaturedSnapshot();

    const primeStartupPanels = () => {
      const ready = locateUi();
      injectWhatsNewNotes();
      syncInlineHostVisibility();
      return ready;
    };

    primeStartupPanels();

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const ready = primeStartupPanels();
      if (ready && tries > 2) clearInterval(timer);
      if (tries > 40) clearInterval(timer);
    }, 500);
    setInterval(() => {
      saveFeaturedSnapshot();
      applyThinkingMusic();
      renderExtraPages();
      injectWhatsNewNotes();
      syncInlineHostVisibility();
    }, 1800);
    window.addEventListener('storage', () => {
      saveFeaturedSnapshot();
      applyThinkingMusic();
      renderExtraPages();
      injectWhatsNewNotes();
      syncInlineHostVisibility();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();



(function(){
  if (window.__stepperStaticStartupInstalled) return;
  window.__stepperStaticStartupInstalled = true;
  const STARTUP_MIN_MS = 3600;
  const STARTUP_FADE_MS = 340;
  function buildStartupAudio(){
    if (window.createAudioElement) {
      const audio = window.createAudioElement(['./startup-song.mp3','./startup-song.m4a']);
      audio.loop = false;
      audio.volume = 1;
      return audio;
    }
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    try { audio.playsInline = true; } catch {}
    [['./startup-song.mp3','audio/mpeg'],['./startup-song.m4a','audio/mp4']].forEach(([src,type]) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      audio.appendChild(source);
    });
    return audio;
  }
  function init(){
    const splash = document.getElementById('stepper-static-startup');
    if (!splash) return;
    const button = splash.querySelector('.stepper-static-startup__button');
    const audio = buildStartupAudio();
    let started = false;
    let leaving = false;
    let fallbackTimer = null;
    function leave(){
      if (leaving) return;
      leaving = true;
      splash.classList.add('is-leaving');
      window.setTimeout(() => {
        try { audio.pause(); audio.currentTime = 0; } catch {}
        splash.hidden = true;
        splash.remove();
      }, STARTUP_FADE_MS);
    }
    function queueLeave(){
      const durationMs = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.max(STARTUP_MIN_MS, Math.round(audio.duration * 1000) + 180) : STARTUP_MIN_MS;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(leave, durationMs);
    }
    function begin(){
      if (started) return;
      started = true;
      splash.classList.add('is-playing');
      audio.addEventListener('ended', leave, { once: true });
      try {
        audio.pause();
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
      } catch {}
      queueLeave();
    }
    if (button) button.addEventListener('click', begin, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();



(function(){
  if (window.__stepperPhrasedToolsInstalled) return;
  window.__stepperPhrasedToolsInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const FEATURED_KEY = 'stepper_featured_dances_v2';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const SAVE_LATER_KEY = 'stepper_save_for_later_v1';
  const SAVE_LATER_SESSION_KEY = 'stepper_save_for_later_session_v1';
  const PHR_PANEL_ID = 'stepper-inline-phrased-tools';
  const MENU_ID = 'stepper-part-context-menu';
  const PREVIEW_NOTE_ID = 'stepper-preview-phrased-summary';
  const FEATURED_EMAIL_KEY = 'stepper_featured_email_v1';
  const FONT_FAMILIES = {
    system: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    rounded: '"Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif',
    elegant: 'Georgia, "Times New Roman", serif'
  };
  const EXTRA_NOTES = [
    "New: My Saved Dances now keeps the saved-dance shelf in its own tab, and the Build page no longer duplicates that whole Featured Dances block.",
    "New: Counts and Walls can stay on Auto now, and the Sheet view shows the real detected numbers instead of printing AUTO.",
    "Just in case: changing font can't be applied. Sorry Bruce Tau but you just got pranked 😛",
    'New: counts now auto-sync from the built step content, and tags are left out of that total on purpose.',
    'New: phrased dance tools now support editable Parts, a Sequence tab, and tag-aware phrased building inspired by CopperKnob-style A/B/C + Tag sheets.',
    'New: Featured Choreo now has its own tab, stays off the Build page, and points submissions to anthonytau4@gmail.com for PDF send-ins.',
    'New: right-click a section header to add that section straight into a new Part, and the labels start at A, B, C but stay editable.',
    'New: Settings now gives you three quick font style buttons, and each one previews its look before you press it.'
  ];
  let lastFeaturedSignature = '';
  let contextMenuState = null;

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readJson(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readAppData(){
    return readJson(DATA_KEY, null);
  }

  function writeAppData(data){
    if (!data) return;
    writeJson(DATA_KEY, data);
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function getSettings(){
    const saved = readJson(SETTINGS_KEY, {});
    return {
      sfxEnabled: saved.sfxEnabled !== false,
      thinkingMusicEnabled: saved.thinkingMusicEnabled === true,
      fontFamily: ['system','rounded','elegant'].includes(saved.fontFamily) ? saved.fontFamily : 'system'
    };
  }

  function saveSettings(settings){
    const current = getSettings();
    writeJson(SETTINGS_KEY, Object.assign({}, current, settings));
  }

  function isDarkMode(){
    const data = readAppData();
    return !!(data && data.isDarkMode);
  }

  function themeClasses(){
    const dark = isDarkMode();
    return {
      dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      button: dark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      accent: dark ? 'bg-indigo-500 text-neutral-950' : 'bg-indigo-600 text-white',
      orange: dark ? 'bg-orange-500 text-neutral-950' : 'bg-orange-500 text-white'
    };
  }

  function getFeaturedRecipient(){
    return localStorage.getItem(FEATURED_EMAIL_KEY) || '';
  }

  function alphaLabel(index){
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (index < letters.length) return letters[index];
    const major = Math.floor(index / letters.length);
    const minor = index % letters.length;
    return letters[minor] + String(major + 1);
  }

  function readStoredPhrasedTools(){
    return readJson(PHR_TOOLS_KEY, {});
  }

  function writeStoredPhrasedTools(value){
    writeJson(PHR_TOOLS_KEY, value || {});
  }

  function normalizePhrasedTools(data, suppliedRaw){
    if (!data) return { danceFormat:'regular', uiTab:'parts', parts:[], sequence:[] };
    const sectionIds = new Set((Array.isArray(data.sections) ? data.sections : []).map(section => section && section.id).filter(Boolean));
    const tagIds = new Set((Array.isArray(data.tags) ? data.tags : []).map(tag => tag && tag.id).filter(Boolean));
    const raw = suppliedRaw || readStoredPhrasedTools() || {};
    const parts = Array.isArray(raw.parts) ? raw.parts.map((part, index) => ({
      id: part && part.id ? String(part.id) : 'part-' + alphaLabel(index).toLowerCase() + '-' + index,
      label: String((part && part.label) || alphaLabel(index)).trim() || alphaLabel(index),
      title: String((part && part.title) || '').trim(),
      sectionIds: Array.isArray(part && part.sectionIds) ? part.sectionIds.filter(id => sectionIds.has(id)) : []
    })).filter(part => part.sectionIds.length > 0 || part.title || part.label) : [];
    const sequence = Array.isArray(raw.sequence) ? raw.sequence.filter(item => item && ((item.kind === 'part' && parts.some(part => part.id === item.id)) || (item.kind === 'tag' && tagIds.has(item.id)))) : [];
    return {
      danceFormat: raw.danceFormat === 'phrased' ? 'phrased' : 'regular',
      uiTab: raw.uiTab === 'sequence' ? 'sequence' : 'parts',
      parts,
      sequence
    };
  }

  function writePhrasedTools(mutator){
    const data = readAppData();
    if (!data) return;
    const current = normalizePhrasedTools(data);
    const next = typeof mutator === 'function' ? mutator(clone(current), clone(data)) : current;
    writeStoredPhrasedTools(next);
  }

  function getMainSections(data){
    return Array.isArray(data && data.sections) ? data.sections : [];
  }

  function getTags(data){
    return Array.isArray(data && data.tags) ? data.tags : [];
  }

  function numericTokens(text){
    const matches = String(text || '').match(/\d+/g);
    return matches ? matches.map(Number).filter(Number.isFinite) : [];
  }

  function deriveSectionCount(section, data){
    const steps = Array.isArray(section && section.steps) ? section.steps : [];
    let maxValue = 0;
    for (const step of steps) {
      const nums = numericTokens(step && step.count);
      for (const value of nums) maxValue = Math.max(maxValue, value || 0);
    }
    if (maxValue > 0) return maxValue;
    const danceType = (data && data.meta && data.meta.type) === 'waltz' ? 6 : 8;
    if (!steps.length) return 0;
    return Math.min(danceType, Math.max(1, steps.length));
  }

  function derivePartCount(part, data){
    const sections = getMainSections(data);
    const map = new Map(sections.map(section => [section.id, section]));
    return (Array.isArray(part && part.sectionIds) ? part.sectionIds : []).reduce((sum, sectionId) => sum + deriveSectionCount(map.get(sectionId), data), 0);
  }

  function deriveCounts(data){
    if (!data) return '-';
    const tools = normalizePhrasedTools(data);
    if (tools.danceFormat === 'phrased' && tools.parts.length) {
      return String(tools.parts.reduce((sum, part) => sum + derivePartCount(part, data), 0) || '-');
    }
    const total = getMainSections(data).reduce((sum, section) => sum + deriveSectionCount(section, data), 0);
    return String(total || '-');
  }

  function turnFractionToEighths(value){
    const key = String(value || '').toLowerCase().trim();
    if (key === 'full') return 8;
    if (key === '1/2') return 4;
    if (key === '1/4') return 2;
    if (key === '3/4') return 6;
    if (key === '1/8') return 1;
    if (key === '3/8') return 3;
    if (key === '5/8') return 5;
    if (key === '7/8') return 7;
    return 0;
  }

  function deriveWalls(data){
    if (!data) return '-';
    const tools = normalizePhrasedTools(data);
    if (tools.danceFormat === 'phrased' && tools.parts.length) return '1';
    const sections = getMainSections(data);
    let totalTurnInEighths = 0;
    sections.forEach((section) => {
      (Array.isArray(section && section.steps) ? section.steps : []).forEach((step) => {
        if (!step || step.type !== 'step') return;
        const descriptionText = String(step.description || '').toLowerCase();
        const nameText = String(step.name || '').toLowerCase();
        const turnPattern = /(?:turn(?:ing)?\s+(full|[1357]\/8|1\/4|1\/2|3\/4)|\b(full|[1357]\/8|1\/4|1\/2|3\/4)\s+turn\b)/g;
        const descriptionMatches = descriptionText.match(turnPattern) || [];
        const nameMatches = descriptionMatches.length ? [] : (nameText.match(turnPattern) || []);
        [...descriptionMatches, ...nameMatches].forEach((match) => {
          const fractionMatch = match.match(/full|[1357]\/8|1\/4|1\/2|3\/4/);
          if (fractionMatch) totalTurnInEighths += turnFractionToEighths(fractionMatch[0]);
        });
      });
    });
    const normalized = ((totalTurnInEighths % 8) + 8) % 8;
    if (normalized === 0) return '1';
    if (normalized === 4) return '2';
    if (normalized > 0) return '4';
    const current = String((data.meta && data.meta.walls) || '').trim();
    return current || '4';
  }

  function levelDisplay(data){
    const meta = (data && data.meta) || {};
    const tools = normalizePhrasedTools(data);
    const level = String(meta.level || 'Unlabelled').trim() || 'Unlabelled';
    return tools.danceFormat === 'phrased' ? level + ' Phrased' : level;
  }

  function sequenceLabel(item, data){
    if (!item) return '';
    const tools = normalizePhrasedTools(data);
    if (item.kind === 'part') {
      const part = tools.parts.find(entry => entry.id === item.id);
      return part ? (part.label || part.title || 'Part') : 'Part';
    }
    if (item.kind === 'tag') {
      const tag = getTags(data).find(entry => entry.id === item.id);
      return tag ? (String(tag.name || 'Tag').trim() || 'Tag') : 'Tag';
    }
    return '';
  }

  function deriveSequenceString(data){
    const tools = normalizePhrasedTools(data);
    if (tools.danceFormat !== 'phrased' || !tools.sequence.length) return '';
    return tools.sequence.map(item => sequenceLabel(item, data)).filter(Boolean).join(', ');
  }

  function currentDanceIdentity(data){
    const meta = (data && data.meta) || {};
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    return {
      id: (title || 'untitled').toLowerCase() + '|' + (choreographer || 'unknown').toLowerCase(),
      title: title || 'Untitled Dance',
      choreographer: choreographer || 'Uncredited'
    };
  }

  function hasDanceContent(data){
    if (!data || !data.meta) return false;
    const identity = currentDanceIdentity(data);
    return !!(identity.title !== 'Untitled Dance' || identity.choreographer !== 'Uncredited' || getMainSections(data).some(section => Array.isArray(section && section.steps) && section.steps.length));
  }

  function buildSnapshotEntry(data){
    const identity = currentDanceIdentity(data);
    const tools = normalizePhrasedTools(data);
    const sections = getMainSections(data);
    const sectionCount = sections.length;
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    return {
      id: identity.id,
      title: identity.title,
      choreographer: identity.choreographer,
      country: String((data.meta && data.meta.country) || '').trim(),
      level: levelDisplay(data),
      counts: deriveCounts(data),
      walls: deriveWalls(data),
      music: String((data.meta && data.meta.music) || '').trim(),
      format: tools.danceFormat,
      sequence: deriveSequenceString(data),
      sections: sectionCount,
      steps: stepCount,
      updatedAt: new Date().toISOString(),
      snapshot: { data: clone(data), phrasedTools: clone(tools) }
    };
  }

  function saveFeaturedSnapshot(){
    const data = readAppData();
    if (!hasDanceContent(data)) return;
    const entry = buildSnapshotEntry(data);
    const signature = JSON.stringify({ id: entry.id, counts: entry.counts, walls: entry.walls, level: entry.level, music: entry.music, format: entry.format, sequence: entry.sequence, snapshot: entry.snapshot });
    if (signature === lastFeaturedSignature) return;
    lastFeaturedSignature = signature;
    let featured = readJson(FEATURED_KEY, []);
    if (!Array.isArray(featured)) featured = [];
    const existingIndex = featured.findIndex(item => item && item.id === entry.id);
    if (existingIndex >= 0) featured[existingIndex] = Object.assign({}, featured[existingIndex], entry);
    else featured.unshift(entry);
    featured.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    featured = featured.slice(0, 120);
    writeJson(FEATURED_KEY, featured);
  }

  function getFeaturedDances(){
    const featured = readJson(FEATURED_KEY, []);
    return Array.isArray(featured) ? featured : [];
  }

  function deleteSavedDance(id){
    const featured = getFeaturedDances().filter(item => item && item.id !== id);
    writeJson(FEATURED_KEY, featured);
  }

  function loadSavedDance(id){
    const entry = getFeaturedDances().find(item => item && item.id === id);
    if (!entry || !entry.snapshot) return;
    const snapshotData = entry.snapshot.data || entry.snapshot;
    writeAppData(snapshotData);
    writeStoredPhrasedTools(entry.snapshot.phrasedTools || {});
    location.reload();
  }

  function getSavedForLater(){
    return readJson(SAVE_LATER_KEY, null);
  }

  function saveCurrentProjectForLater(){
    const data = readAppData();
    if (!hasDanceContent(data)) return false;
    const payload = {
      savedAt: new Date().toISOString(),
      snapshot: {
        data: clone(data),
        phrasedTools: clone(normalizePhrasedTools(data))
      }
    };
    writeJson(SAVE_LATER_KEY, payload);
    try { sessionStorage.setItem(SAVE_LATER_SESSION_KEY, 'ready'); } catch {}
    return true;
  }

  function maybeRestoreSavedForLaterOnBoot(){
    let payload = null;
    try { payload = getSavedForLater(); } catch {}
    if (!payload || !payload.snapshot) return false;
    try {
      if (sessionStorage.getItem(SAVE_LATER_SESSION_KEY) === 'restored') return false;
    } catch {}
    const targetData = payload.snapshot.data || payload.snapshot;
    const targetTools = payload.snapshot.phrasedTools || {};
    const currentData = readAppData();
    const currentTools = readStoredPhrasedTools();
    const same = JSON.stringify(currentData || {}) === JSON.stringify(targetData || {}) && JSON.stringify(currentTools || {}) === JSON.stringify(targetTools || {});
    if (!same) {
      writeAppData(targetData);
      writeStoredPhrasedTools(targetTools);
      try { sessionStorage.setItem(SAVE_LATER_SESSION_KEY, 'restored'); } catch {}
      location.reload();
      return true;
    }
    try { sessionStorage.setItem(SAVE_LATER_SESSION_KEY, 'restored'); } catch {}
    return false;
  }

  function buildFeaturedSubmissionLink(source){
    const entry = source || buildSnapshotEntry(readAppData() || { meta:{} });
    const subject = `Step by Stepper Featured Dance Submission – ${entry.title}`;
    const to = getFeaturedRecipient();
    const body = [
      'Hello,',
      '',
      'Please review this dance for the Featured Dances section in Step by Stepper.',
      '(You must attach the PDF.)',
      '',
      `Dance Title: ${entry.title}`,
      `Choreographer: ${entry.choreographer}`,
      '',
      'Sent from Step by Stepper.'
    ].join('\n');
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function formatDate(iso){
    try { return new Date(iso).toLocaleString(); } catch { return 'Recently'; }
  }

  function ensureCustomStyles(){
    if (document.getElementById('stepper-phrased-tools-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-phrased-tools-style';
    style.textContent = `
      #root, #stepper-static-startup, #root button, #root input, #root select, #root textarea { font-family: var(--stepper-font-family, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif); }
      .stepper-extra-tab-icon, .stepper-setting-icon, .stepper-panel-icon { display:inline-flex; align-items:center; justify-content:center; width:1.45rem; height:1.45rem; }
      .stepper-extra-tab-icon svg, .stepper-setting-icon svg, .stepper-panel-icon svg { width:100%; height:100%; }
      .stepper-part-pill { display:inline-flex; align-items:center; gap:.45rem; padding:.55rem .8rem; border-radius:999px; font-weight:800; font-size:.76rem; letter-spacing:.08em; text-transform:uppercase; }
      .stepper-mini-btn { border-radius:999px; padding:.55rem .9rem; font-weight:800; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; border:1px solid rgba(99,102,241,.25); }
      .stepper-tools-tab { border-radius:999px; padding:.55rem .9rem; font-weight:800; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; border:1px solid transparent; }
      .stepper-tools-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; }
      .stepper-field label { display:block; font-size:.68rem; font-weight:900; letter-spacing:.14em; text-transform:uppercase; margin-bottom:.45rem; }
      .stepper-field input, .stepper-field select { width:100%; border-radius:1rem; border:1px solid rgba(148,163,184,.35); padding:.85rem .95rem; background:rgba(255,255,255,.9); color:#111827; }
      .dark .stepper-field input, .dark .stepper-field select { background:rgba(23,23,23,.9); color:#f5f5f5; border-color:rgba(64,64,64,.9); }
      .stepper-font-choice { width:100%; text-align:left; border-radius:1.35rem; border:1px solid rgba(99,102,241,.18); padding:1rem 1rem .95rem; transition:transform .15s ease, border-color .15s ease, box-shadow .15s ease; }
      .stepper-font-choice:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(79,70,229,.12); }
      .stepper-font-choice strong { display:block; font-size:1rem; line-height:1.15; }
      .stepper-font-choice span { display:block; margin-top:.3rem; font-size:.8rem; opacity:.8; }
      .stepper-font-choice[data-active="true"] { border-color:rgba(79,70,229,.72); box-shadow:0 0 0 2px rgba(99,102,241,.18); }
      .stepper-seq-row { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:.65rem; align-items:center; }
      .stepper-danger-btn { border-radius:999px; padding:.55rem .75rem; font-weight:900; text-transform:uppercase; letter-spacing:.08em; font-size:.7rem; }
      #${MENU_ID} { position:fixed; z-index:9999; min-width:220px; border-radius:18px; padding:.55rem; box-shadow:0 18px 36px rgba(0,0,0,.28); }
      #${MENU_ID}[hidden] { display:none; }
      #${MENU_ID} button { width:100%; text-align:left; border-radius:14px; padding:.85rem .95rem; font-weight:800; }
      .stepper-section-header-partable { position:relative; }
      .stepper-section-part-btn { position:absolute; right:2.75rem; top:50%; transform:translateY(-50%); font-size:.58rem; letter-spacing:.12em; text-transform:uppercase; padding:.32rem .55rem; border-radius:999px; background:rgba(99,102,241,.14); color:#4f46e5; font-weight:900; border:0; }
      #${PREVIEW_NOTE_ID} { margin-top:1rem; }
      .stepper-help-fab { position:fixed; left:16px; bottom:16px; z-index:2147483500; width:50px; height:50px; border-radius:999px; border:0; background:#4f46e5; color:#fff; font-size:26px; font-weight:900; box-shadow:0 16px 28px rgba(0,0,0,.28); }
      .stepper-help-panel { position:fixed; left:16px; bottom:76px; z-index:2147483499; width:min(92vw, 360px); max-height:min(70vh, 520px); overflow:auto; border-radius:24px; padding:18px; box-shadow:0 18px 40px rgba(0,0,0,.28); }
      .stepper-help-panel[hidden] { display:none !important; }
      .stepper-help-panel h3 { margin:0 0 10px; font-size:1.05rem; font-weight:900; }
      .stepper-help-panel p { margin:.4rem 0; line-height:1.45; }
      .stepper-help-code { display:block; margin-top:6px; padding:8px 10px; border-radius:12px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:.82rem; }
      @media (max-width: 640px) {
        .stepper-seq-row { grid-template-columns:minmax(0,1fr) auto; }
        .stepper-seq-row .stepper-row-trash { grid-column:1 / -1; }
      }
    `;
    document.head.appendChild(style);
  }

  function applyFontSettings(){
    const settings = getSettings();
    document.documentElement.style.setProperty('--stepper-font-family', FONT_FAMILIES[settings.fontFamily] || FONT_FAMILIES.system);
  }

  function ensureInlineHost(){
    const host = document.getElementById('stepper-editor-inline-host');
    if (!host) return null;
    let stack = host.querySelector('div.space-y-5');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'space-y-5';
      while (host.firstChild) stack.appendChild(host.firstChild);
      host.appendChild(stack);
    }
    let panel = document.getElementById(PHR_PANEL_ID);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = PHR_PANEL_ID;
      const settingsPanel = document.getElementById('stepper-inline-settings');
      if (settingsPanel && settingsPanel.parentNode === stack) stack.insertBefore(panel, settingsPanel);
      else stack.appendChild(panel);
    }
    return host;
  }

  function iconShoe(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h5.426a1 1 0 0 1 .863.496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114A4 4 0 0 1 21 14.73V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"></path><path d="m14 13 1-2"></path><path d="M8 18v-1a4 4 0 0 0-4-4H3"></path><path d="m10 12 1.5-3"></path></svg>';
  }
  function iconCog(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.4a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.97 4.1a1.7 1.7 0 0 0 1.03-1.56V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"></path></svg>';
  }
  function iconSpeaker(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  }
  function iconMusic(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle><line x1="5" y1="19" x2="19" y2="5"></line></svg>';
  }
  function iconSparkles(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"></path><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"></path><path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z"></path></svg>';
  }


  function scrollToPhrasedPanel(){
    const panel = document.getElementById(PHR_PANEL_ID);
    if (!panel) return;
    panel.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  let lastFormattingField = null;

  function isTextEntryField(field){
    if (!field) return false;
    if (field instanceof HTMLTextAreaElement) return true;
    if (!(field instanceof HTMLInputElement)) return false;
    const type = String(field.type || 'text').toLowerCase();
    return !['button','checkbox','color','file','hidden','image','radio','range','reset','submit'].includes(type);
  }

  function rememberFormattingTarget(field){
    if (!isTextEntryField(field)) return;
    lastFormattingField = field;
    try {
      field.__stepperSelStart = typeof field.selectionStart === 'number' ? field.selectionStart : (field.value || '').length;
      field.__stepperSelEnd = typeof field.selectionEnd === 'number' ? field.selectionEnd : (field.value || '').length;
    } catch {}
  }

  function getFormattingTarget(){
    const active = document.activeElement;
    if (isTextEntryField(active)) {
      rememberFormattingTarget(active);
      return active;
    }
    if (isTextEntryField(lastFormattingField) && document.contains(lastFormattingField)) return lastFormattingField;
    return null;
  }

  function wrapSelectionWithMarkers(field, openMarker, closeMarker, forcedStart, forcedEnd){
    if (!field || typeof field.value !== 'string') return;
    const start = typeof forcedStart === 'number'
      ? forcedStart
      : (typeof field.selectionStart === 'number' ? field.selectionStart : (typeof field.__stepperSelStart === 'number' ? field.__stepperSelStart : field.value.length));
    const end = typeof forcedEnd === 'number'
      ? forcedEnd
      : (typeof field.selectionEnd === 'number' ? field.selectionEnd : (typeof field.__stepperSelEnd === 'number' ? field.__stepperSelEnd : field.value.length));
    const safeStart = Math.max(0, Math.min(start, field.value.length));
    const safeEnd = Math.max(safeStart, Math.min(end, field.value.length));
    const value = field.value || '';
    const selected = value.slice(safeStart, safeEnd);
    const replacement = openMarker + selected + closeMarker;
    field.value = value.slice(0, safeStart) + replacement + value.slice(safeEnd);
    const caretStart = safeStart + openMarker.length;
    const caretEnd = selected ? caretStart + selected.length : caretStart;
    field.__stepperSelStart = caretStart;
    field.__stepperSelEnd = caretEnd;
    field.dispatchEvent(new Event('input', { bubbles:true }));
    field.dispatchEvent(new Event('change', { bubbles:true }));
    requestAnimationFrame(() => {
      try {
        field.focus();
        field.setSelectionRange(caretStart, caretEnd);
        rememberFormattingTarget(field);
      } catch {}
    });
  }

  function applyFormattingMarker(openMarker, closeMarker){
    const field = getFormattingTarget();
    if (!field) return false;
    wrapSelectionWithMarkers(field, openMarker, closeMarker, field.__stepperSelStart, field.__stepperSelEnd);
    return true;
  }

  function ensureEditorFormattingShortcuts(){
    if (window.__stepperFormattingShortcutsWired) return;
    window.__stepperFormattingShortcutsWired = true;

    const schedulePreviewRefresh = (() => {
      let queued = false;
      return () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          patchPreviewSurface();
        });
      };
    })();

    const handleFormattingButton = (event) => {
      const button = event.target && event.target.closest ? event.target.closest('button,[role="button"]') : null;
      if (!button) return;
      const label = [button.getAttribute('aria-label'), button.getAttribute('title'), button.textContent]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      if (!label) return;
      let handled = false;
      if (/^(?:b|bold|format bold)$/.test(label)) handled = applyFormattingMarker('**', '**');
      else if (/^(?:i|italic|italics|format italic|format italics)$/.test(label)) handled = applyFormattingMarker('/*', '*/');
      else if (/^(?:u|underline|format underline)$/.test(label)) handled = applyFormattingMarker('_', '_');
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        schedulePreviewRefresh();
      }
    };

    document.addEventListener('focusin', (event) => rememberFormattingTarget(event.target), true);
    document.addEventListener('click', (event) => rememberFormattingTarget(event.target), true);
    document.addEventListener('keyup', (event) => rememberFormattingTarget(event.target), true);
    document.addEventListener('input', (event) => {
      rememberFormattingTarget(event.target);
      schedulePreviewRefresh();
    }, true);
    document.addEventListener('selectionchange', () => rememberFormattingTarget(document.activeElement), true);
    document.addEventListener('click', handleFormattingButton, true);
    document.addEventListener('keydown', (event) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && !event.altKey;
      if (!isShortcut) return;
      const key = (event.key || '').toLowerCase();
      let handled = false;
      if (key === 'b') handled = applyFormattingMarker('**', '**');
      else if (key === 'i') handled = applyFormattingMarker('/*', '*/');
      else if (key === 'u') handled = applyFormattingMarker('_', '_');
      if (handled) {
        event.preventDefault();
        schedulePreviewRefresh();
      }
    });
  }

  function ensureHelpMenu(){
    let fab = document.getElementById('stepper-help-fab');
    let panel = document.getElementById('stepper-help-panel');
    const theme = themeClasses();
    if (!fab) {
      fab = document.createElement('button');
      fab.id = 'stepper-help-fab';
      fab.className = 'stepper-help-fab';
      fab.type = 'button';
      fab.setAttribute('aria-label','Help');
      fab.textContent = '?';
      document.body.appendChild(fab);
    }
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'stepper-help-panel';
      panel.className = 'stepper-help-panel';
      panel.hidden = true;
      document.body.appendChild(panel);
    }
    panel.className = `stepper-help-panel ${theme.shell}`;
    panel.innerHTML = `
      <h3>Help</h3>
      <p><strong>Why the page can jump:</strong> Step by Stepper re-syncs counts, parts, preview notes and saved-dance panels after big edits. This build calms that down, but a large update can still make it twitch for a moment.</p>
      <p><strong>Bolding</strong><span class="stepper-help-code ${theme.panel}">**Sample Text**</span></p>
      <p><strong>Italics</strong><span class="stepper-help-code ${theme.panel}">/*Sample Text*/</span></p>
      <p><strong>Underline</strong><span class="stepper-help-code ${theme.panel}">_Sample Text_</span></p>
      <p><strong>Computer shortcuts</strong><span class="stepper-help-code ${theme.panel}">Ctrl+B bold · Ctrl+I italics · Ctrl+U underline</span></p>
    `;
    if (!fab.__stepperHelpWired) {
      fab.__stepperHelpWired = true;
      fab.addEventListener('click', () => { panel.hidden = !panel.hidden; });
      document.addEventListener('click', (event) => {
        if (panel.hidden) return;
        if (event.target === fab || fab.contains(event.target) || panel.contains(event.target)) return;
        panel.hidden = true;
      });
    }
  }

  function renderSettingsPanel(){
    const panel = document.getElementById('stepper-inline-settings');
    if (!panel) return;
    const theme = themeClasses();
    const settings = getSettings();
    const fontChoices = [
      { key:'system', title:'Classic', sample:'Clean editor finish', family: FONT_FAMILIES.system },
      { key:'rounded', title:'Rounded', sample:'Soft and friendly', family: FONT_FAMILIES.rounded },
      { key:'elegant', title:'Elegant', sample:'Formal sheet look', family: FONT_FAMILIES.elegant }
    ];
    panel.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    panel.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-panel-icon">${iconCog()}</span> Settings</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
          <div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle} mb-3">Font Style</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${fontChoices.map(choice => `
              <button type="button" class="stepper-font-choice ${theme.button}" data-font-choice="${choice.key}" data-active="${settings.fontFamily === choice.key ? 'true' : 'false'}" style="font-family:${choice.family}">
                <strong>${escapeHtml(choice.title)}</strong>
                <span>${escapeHtml(choice.sample)}</span>
              </button>
            `).join('')}
          </div>
        </div>
        <button type="button" data-stepper-setting="sfx" class="rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div><div class="text-lg font-black tracking-tight">SFX Sounds</div><p class="mt-1 text-sm ${theme.subtle}">Menu clicks, tab changes and all the little app noises.</p></div>
          <div class="flex items-center gap-3 shrink-0"><span class="stepper-setting-icon">${iconSpeaker(settings.sfxEnabled)}</span><span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.sfxEnabled ? 'On' : 'Off'}</span></div>
        </button>
        <button type="button" data-stepper-setting="thinking" class="rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div><div class="text-lg font-black tracking-tight">Thinking Music</div><p class="mt-1 text-sm ${theme.subtle}">Loops the lobby track while you work without resetting every few seconds.</p></div>
          <div class="flex items-center gap-3 shrink-0"><span class="stepper-setting-icon">${iconMusic(settings.thinkingMusicEnabled)}</span><span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.thinkingMusicEnabled ? 'On' : 'Off'}</span></div>
        </button>
      </div>
    `;
    panel.querySelector('[data-stepper-setting="sfx"]').addEventListener('click', () => { const current = getSettings(); current.sfxEnabled = !current.sfxEnabled; saveSettings(current); renderSettingsPanel(); });
    panel.querySelector('[data-stepper-setting="thinking"]').addEventListener('click', () => { const current = getSettings(); current.thinkingMusicEnabled = !current.thinkingMusicEnabled; saveSettings(current); renderSettingsPanel(); });
    panel.querySelectorAll('[data-font-choice]').forEach(button => {
      button.addEventListener('click', () => {
        saveSettings({ fontFamily: button.getAttribute('data-font-choice') || 'system' });
        applyFontSettings();
        renderSettingsPanel();
      });
    });
  }

  function renderChoreoPanel(){
    const panel = document.getElementById('stepper-inline-choreography');
    if (!panel) return;
    panel.innerHTML = '';
    panel.style.display = 'none';
    return;
    const theme = themeClasses();
    const currentData = readAppData();
    const currentEntry = hasDanceContent(currentData) ? buildSnapshotEntry(currentData) : null;
    const featured = getFeaturedDances();
    const cards = featured.length ? featured.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-saved-dance-id="${escapeHtml(item.id)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title)}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer)}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
          </div>
          <span class="stepper-part-pill ${theme.dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(item.level)}</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Format</div><div class="mt-1 font-bold">${escapeHtml(item.format === 'phrased' ? 'Phrased' : 'Regular')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        ${item.sequence ? `<p class="mt-4 text-sm leading-relaxed ${theme.subtle}"><strong class="${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">Sequence:</strong> ${escapeHtml(item.sequence)}</p>` : ''}
        ${item.music ? `<p class="mt-2 text-sm leading-relaxed ${theme.subtle}"><strong class="${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">Music:</strong> ${escapeHtml(item.music)}</p>` : ''}
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" data-action="load" class="stepper-mini-btn ${theme.button}">Load</button>
          <a href="${escapeHtml(buildFeaturedSubmissionLink(item))}" class="stepper-mini-btn ${theme.orange}">Gmail PDF</a>
          <button type="button" data-action="delete" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">🗑 Delete</button>
          <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Saved ${escapeHtml(formatDate(item.updatedAt))}</span>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-bold">No saved dances yet.</p><p class="mt-2 ${theme.subtle}">Build a dance and it will save here automatically on this device.</p></div>`;
    panel.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    panel.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-panel-icon">${iconShoe()}</span> Choreography / Featured Dances</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <p class="text-base sm:text-lg font-bold leading-relaxed">Dances you make with Step by Stepper are collected here automatically on this device. Use Gmail to submit one for featuring, and make sure you attach the PDF before you send it.</p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <a href="${escapeHtml(buildFeaturedSubmissionLink(currentEntry || buildSnapshotEntry(currentData || { meta:{} })))}" class="stepper-mini-btn ${theme.orange}">Submit current dance via Gmail</a>
            <button type="button" data-action="save-for-later" class="stepper-mini-btn ${theme.button}">Save for later</button>
            <p class="text-sm ${theme.subtle}">The Gmail text now tells them to attach the PDF instead of dumping the whole dance in the body. Save for later locks this current project in so it comes back next time you open the page.</p>
          </div>
          ${(() => { const saved = getSavedForLater(); return saved && saved.savedAt ? `<p class="mt-3 text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Saved for later ${escapeHtml(formatDate(saved.savedAt))}</p>` : ''; })()}
        </div>
        ${cards}
      </div>
    `;
    panel.querySelectorAll('[data-saved-dance-id]').forEach(card => {
      const id = card.getAttribute('data-saved-dance-id');
      const loadBtn = card.querySelector('[data-action="load"]');
      const deleteBtn = card.querySelector('[data-action="delete"]');
      if (loadBtn) loadBtn.addEventListener('click', () => loadSavedDance(id));
      if (deleteBtn) deleteBtn.addEventListener('click', () => {
        const entry = getFeaturedDances().find(item => item && item.id === id);
        const name = entry ? entry.title : 'this dance';
        if (confirm(`Delete saved dance \"${name}\"?`)) {
          deleteSavedDance(id);
          renderChoreoPanel();
        }
      });
    });
    const saveForLaterBtn = panel.querySelector('[data-action="save-for-later"]');
    if (saveForLaterBtn) saveForLaterBtn.addEventListener('click', () => {
      if (saveCurrentProjectForLater()) {
        alert('Current project saved for later. It will come back the next time you open Step by Stepper.');
        renderChoreoPanel();
      } else {
        alert('Build something first, then save it for later.');
      }
    });
  }

  function ensurePartDefaults(data){
    const tools = normalizePhrasedTools(data);
    writeStoredPhrasedTools(tools);
    return tools;
  }

  function addPartFromSection(sectionId){
    writePhrasedTools((tools, data) => {
      const sections = getMainSections(data);
      const section = sections.find(item => item && item.id === sectionId);
      if (!section) return tools;
      const label = alphaLabel(tools.parts.length);
      tools.danceFormat = 'phrased';
      tools.uiTab = 'parts';
      tools.parts.push({ id: 'part-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), label, title: String(section.name || '').trim(), sectionIds: [sectionId] });
      if (!tools.sequence.length) tools.sequence.push({ kind:'part', id: tools.parts[tools.parts.length - 1].id });
      return tools;
    });
    renderCustomPanels();
    scrollToPhrasedPanel();
  }

  function renderPhrasedPanel(){
    const panel = document.getElementById(PHR_PANEL_ID);
    if (!panel) return;
    const data = readAppData() || { meta:{}, sections:[], tags:[] };
    const tools = ensurePartDefaults(data);
    const theme = themeClasses();
    const sections = getMainSections(data);
    const tags = getTags(data);
    const options = [
      ...tools.parts.map(part => ({ value: `part:${part.id}`, label: `Part ${part.label}` })),
      ...tags.map(tag => ({ value: `tag:${tag.id}`, label: String(tag.name || 'Tag').trim() || 'Tag' }))
    ];
    const partsHtml = tools.parts.length ? tools.parts.map((part, index) => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-part-id="${escapeHtml(part.id)}">
        <div class="stepper-tools-grid">
          <div class="stepper-field"><label>Part Label</label><input type="text" maxlength="8" data-part-field="label" value="${escapeHtml(part.label)}"></div>
          <div class="stepper-field"><label>Part Title</label><input type="text" maxlength="80" data-part-field="title" value="${escapeHtml(part.title)}" placeholder="Optional Part Title"></div>
        </div>
        <div class="mt-4">
          <div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections in this Part</div>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${sections.map(section => {
              const checked = part.sectionIds.includes(section.id);
              return `<label class="rounded-2xl border px-4 py-3 ${theme.panel} flex items-center gap-3"><input type="checkbox" data-part-section="${escapeHtml(section.id)}" ${checked ? 'checked' : ''}><span class="font-semibold">${escapeHtml(String(section.name || 'Untitled Section').trim() || `Section ${index + 1}`)}</span></label>`;
            }).join('')}
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span class="stepper-part-pill ${theme.dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(part.label || alphaLabel(index))}</span>
          <span class="text-sm font-semibold ${theme.subtle}">${derivePartCount(part, data)} counts</span>
          <button type="button" data-action="remove-part" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Remove Part</button>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 ${theme.soft}"><p class="font-bold">No Parts yet.</p><p class="mt-2 ${theme.subtle}">Right-click a section header and choose <strong>Add Part</strong>, or use the button below to make one manually.</p></div>`;

    const sequenceHtml = tools.sequence.length ? tools.sequence.map((item, index) => `
      <div class="stepper-seq-row" data-seq-index="${index}">
        <div class="stepper-field"><label>${index === 0 ? 'Sequence' : 'Next'}</label><select data-seq-select>${options.map(option => `<option value="${escapeHtml(option.value)}" ${option.value === `${item.kind}:${item.id}` ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></div>
        <button type="button" data-action="add-after" class="stepper-mini-btn ${theme.accent}">+</button>
        <button type="button" data-action="remove-seq" class="stepper-danger-btn stepper-row-trash ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Delete</button>
      </div>
    `).join('') : `<div class="rounded-3xl border p-6 ${theme.soft}"><p class="font-bold">No Sequence yet.</p><p class="mt-2 ${theme.subtle}">Pick a Part, press the plus button, and keep building the phrased order exactly like a CopperKnob sequence.</p></div>`;

    panel.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    panel.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-panel-icon">${iconSparkles()}</span> Phrased Dance Tools</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <div class="stepper-tools-grid">
            <div class="stepper-field">
              <label for="stepper-dance-format">Dance Format</label>
              <select id="stepper-dance-format">
                <option value="regular" ${tools.danceFormat === 'regular' ? 'selected' : ''}>Regular</option>
                <option value="phrased" ${tools.danceFormat === 'phrased' ? 'selected' : ''}>Phrased</option>
              </select>
            </div>
            <div class="rounded-2xl border px-4 py-4 ${theme.soft}">
              <div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Auto Sheet Meta</div>
              <div class="mt-2 font-bold">Count: ${escapeHtml(deriveCounts(data))} · Wall: ${escapeHtml(deriveWalls(data))}</div>
              <p class="mt-1 text-sm ${theme.subtle}">Tags are left out of the count, matching phrased-sheet practice.</p>
            </div>
          </div>
        </div>
        ${tools.danceFormat === 'phrased' ? `
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" data-tools-tab="parts" class="stepper-tools-tab ${tools.uiTab !== 'sequence' ? theme.accent : theme.button}">Parts</button>
            ${tools.parts.length ? `<button type="button" data-tools-tab="sequence" class="stepper-tools-tab ${tools.uiTab === 'sequence' ? theme.accent : theme.button}">Sequence</button>` : ''}
            <button type="button" data-action="add-empty-part" class="stepper-mini-btn ${theme.orange}">Add Part</button>
            ${tools.sequence.length ? `<span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">Sequence: ${escapeHtml(deriveSequenceString(data))}</span>` : ''}
          </div>
          ${tools.uiTab === 'sequence' && tools.parts.length ? `<div class="space-y-4">${sequenceHtml}</div>` : `<div class="space-y-4">${partsHtml}</div>`}
        ` : `<div class="rounded-3xl border p-6 ${theme.soft}"><p class="font-bold">Switch the dance to <strong>Phrased</strong> when you want editable Parts and a Sequence tab.</p><p class="mt-2 ${theme.subtle}">That matches common phrased sheets where Part A / B / C and Tags are sequenced separately.</p></div>`}
      </div>
    `;

    const formatSelect = panel.querySelector('#stepper-dance-format');
    if (formatSelect) formatSelect.addEventListener('change', (event) => {
      writePhrasedTools((tools) => {
        tools.danceFormat = event.target.value === 'phrased' ? 'phrased' : 'regular';
        if (tools.danceFormat !== 'phrased') tools.uiTab = 'parts';
        return tools;
      });
      renderCustomPanels();
    });

    panel.querySelectorAll('[data-tools-tab]').forEach(button => button.addEventListener('click', () => {
      const nextTab = button.getAttribute('data-tools-tab');
      writePhrasedTools((tools) => { tools.uiTab = nextTab === 'sequence' ? 'sequence' : 'parts'; return tools; });
      renderCustomPanels();
    }));

    const addEmpty = panel.querySelector('[data-action="add-empty-part"]');
    if (addEmpty) addEmpty.addEventListener('click', () => {
      writePhrasedTools((tools, currentData) => {
        const label = alphaLabel(tools.parts.length);
        const firstSection = getMainSections(currentData)[0];
        tools.parts.push({ id:'part-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), label, title:'', sectionIds:firstSection ? [firstSection.id] : [] });
        tools.danceFormat = 'phrased';
        tools.uiTab = 'parts';
        if (!tools.sequence.length) tools.sequence.push({ kind:'part', id:tools.parts[tools.parts.length - 1].id });
        return tools;
      });
      renderCustomPanels();
      scrollToPhrasedPanel();
    });

    panel.querySelectorAll('[data-part-id]').forEach(card => {
      const partId = card.getAttribute('data-part-id');
      const labelInput = card.querySelector('[data-part-field="label"]');
      const titleInput = card.querySelector('[data-part-field="title"]');
      if (labelInput) labelInput.addEventListener('input', (event) => {
        writePhrasedTools((tools) => { const part = tools.parts.find(item => item.id === partId); if (part) part.label = event.target.value || part.label; return tools; });
      });
      if (titleInput) titleInput.addEventListener('input', (event) => {
        writePhrasedTools((tools) => { const part = tools.parts.find(item => item.id === partId); if (part) part.title = event.target.value || ''; return tools; });
      });
      card.querySelectorAll('[data-part-section]').forEach(box => box.addEventListener('change', () => {
        writePhrasedTools((tools) => {
          const part = tools.parts.find(item => item.id === partId);
          if (!part) return tools;
          const ids = new Set(part.sectionIds);
          if (box.checked) ids.add(box.getAttribute('data-part-section'));
          else ids.delete(box.getAttribute('data-part-section'));
          part.sectionIds = Array.from(ids);
          return tools;
        });
        renderCustomPanels();
      }));
      const removeBtn = card.querySelector('[data-action="remove-part"]');
      if (removeBtn) removeBtn.addEventListener('click', () => {
        writePhrasedTools((tools) => {
          tools.parts = tools.parts.filter(item => item.id !== partId);
          tools.sequence = tools.sequence.filter(item => !(item.kind === 'part' && item.id === partId));
          if (!tools.parts.length) tools.uiTab = 'parts';
          return tools;
        });
        renderCustomPanels();
      });
    });

    panel.querySelectorAll('[data-seq-index]').forEach(row => {
      const index = Number(row.getAttribute('data-seq-index')) || 0;
      const select = row.querySelector('[data-seq-select]');
      if (select) select.addEventListener('change', (event) => {
        writePhrasedTools((tools) => {
          const [kind, id] = String(event.target.value || '').split(':');
          tools.sequence[index] = { kind, id };
          return tools;
        });
        renderCustomPanels();
      });
      const addAfter = row.querySelector('[data-action="add-after"]');
      if (addAfter) addAfter.addEventListener('click', () => {
        writePhrasedTools((tools) => {
          const fallback = tools.parts[0] ? { kind:'part', id:tools.parts[0].id } : (getTags(data)[0] ? { kind:'tag', id:getTags(data)[0].id } : null);
          if (fallback) tools.sequence.splice(index + 1, 0, fallback);
          return tools;
        });
        renderCustomPanels();
      });
      const removeSeq = row.querySelector('[data-action="remove-seq"]');
      if (removeSeq) removeSeq.addEventListener('click', () => {
        writePhrasedTools((tools) => { tools.sequence.splice(index, 1); return tools; });
        renderCustomPanels();
      });
    });
  }

  function renderCustomPanels(){
    ensureInlineHost();
    renderPhrasedPanel();
    renderChoreoPanel();
    renderSettingsPanel();
    wireManualCountsAndWallsOverrides();
    const syncedStats = syncAutoCountsAndWalls(false);
    if (syncedStats) {
      ensureAutoOption('Counts', syncedStats.counts);
      ensureAutoOption('Walls', syncedStats.walls);
      syncCountsWallsField('Counts', syncedStats.counts, syncedStats.autoCounts);
      syncCountsWallsField('Walls', syncedStats.walls, syncedStats.autoWalls);
    }
    saveFeaturedSnapshot();
    patchPreviewSurface();
  }

  function findFieldControlByText(labelText){
    const main = document.querySelector('main');
    if (!main) return null;
    const labels = Array.from(main.querySelectorAll('label, div, section'));
    const matcher = new RegExp('^' + labelText + '$', 'i');
    for (const node of labels) {
      const ownText = (node.firstChild && node.firstChild.textContent ? node.firstChild.textContent : node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!matcher.test(ownText)) continue;
      const control = node.querySelector('select, input');
      if (control) return control;
    }
    return null;
  }

  const AUTO_SELECT_VALUE = '__AUTO__';

  function ensureAutoOption(labelText, autoValue){
    const control = findFieldControlByText(labelText);
    if (!control || control.tagName !== 'SELECT') return null;
    let option = Array.from(control.options || []).find((entry) => String(entry.value) === AUTO_SELECT_VALUE);
    if (!option) {
      option = document.createElement('option');
      option.value = AUTO_SELECT_VALUE;
      control.insertBefore(option, control.firstChild || null);
    }
    option.textContent = `Auto (${String(autoValue || '').trim() || '-'})`;
    return control;
  }

  function syncCountsWallsField(labelText, value, autoEnabled){
    const control = ensureAutoOption(labelText, value) || findFieldControlByText(labelText);
    if (!control) return false;
    const nextValue = autoEnabled ? AUTO_SELECT_VALUE : String(value);
    if (String(control.value) === String(nextValue)) return true;
    control.__stepperAutoSyncing = true;
    control.value = String(nextValue);
    control.dispatchEvent(new Event('input', { bubbles:true }));
    control.dispatchEvent(new Event('change', { bubbles:true }));
    setTimeout(() => { control.__stepperAutoSyncing = false; }, 0);
    return true;
  }

  function trySyncFieldByText(labelText, value, autoEnabled){
    if (labelText === 'Counts' || labelText === 'Walls') {
      return syncCountsWallsField(labelText, value, !!autoEnabled);
    }
    const control = findFieldControlByText(labelText);
    if (!control) return false;
    if (String(control.value) === String(value)) return true;
    control.__stepperAutoSyncing = true;
    control.value = String(value);
    control.dispatchEvent(new Event('input', { bubbles:true }));
    control.dispatchEvent(new Event('change', { bubbles:true }));
    setTimeout(() => { control.__stepperAutoSyncing = false; }, 0);
    return true;
  }

  function syncAutoCountsAndWalls(forceWrite){
    const data = readAppData();
    if (!data) return null;
    data.meta = data.meta || {};
    let changed = false;
    if (typeof data.meta.autoCounts !== 'boolean') {
      data.meta.autoCounts = true;
      changed = true;
    }
    if (typeof data.meta.autoWalls !== 'boolean') {
      data.meta.autoWalls = true;
      changed = true;
    }
    const derivedCounts = String(deriveCounts(data));
    const derivedWalls = String(deriveWalls(data));
    let nextCounts = derivedCounts;
    let nextWalls = derivedWalls;
    if (data.meta.autoCounts === false) {
      nextCounts = String(data.meta.counts || '').trim() || derivedCounts;
    } else if (String(data.meta.counts || '') !== derivedCounts) {
      data.meta.counts = derivedCounts;
      changed = true;
    }
    if (data.meta.autoWalls === false) {
      nextWalls = String(data.meta.walls || '').trim() || derivedWalls;
    } else if (String(data.meta.walls || '') !== derivedWalls) {
      data.meta.walls = derivedWalls;
      changed = true;
    }
    if (changed || forceWrite) writeAppData(data);
    return { data, counts: nextCounts, walls: nextWalls, changed, autoCounts: data.meta.autoCounts !== false, autoWalls: data.meta.autoWalls !== false };
  }

  function wireManualCountsAndWallsOverrides(){
    const bind = (labelText, metaKey, autoKey, deriveFn) => {
      const control = ensureAutoOption(labelText, deriveFn(readAppData() || { meta:{}, sections:[], tags:[] })) || findFieldControlByText(labelText);
      if (!control || control.__stepperManualOverrideWired) return;
      control.__stepperManualOverrideWired = true;
      control.addEventListener('change', () => {
        if (control.__stepperAutoSyncing) return;
        setTimeout(() => {
          const data = readAppData();
          if (!data) return;
          data.meta = data.meta || {};
          const rawValue = String(control.value || '').trim();
          if (rawValue === AUTO_SELECT_VALUE) {
            data.meta[autoKey] = true;
            data.meta[metaKey] = String(deriveFn(data));
          } else {
            data.meta[metaKey] = rawValue;
            data.meta[autoKey] = false;
          }
          writeAppData(data);
          saveFeaturedSnapshot();
          const synced = syncAutoCountsAndWalls(true);
          if (synced) {
            syncCountsWallsField('Counts', synced.counts, synced.autoCounts);
            syncCountsWallsField('Walls', synced.walls, synced.autoWalls);
          }
        }, 0);
      });
    };
    bind('Counts', 'counts', 'autoCounts', deriveCounts);
    bind('Walls', 'walls', 'autoWalls', deriveWalls);
  }

  function wirePreviewAutoStats(){
    const sheetBtn = Array.from(document.querySelectorAll('button')).find((button) => ((button.textContent || '').trim() === 'Sheet'));
    if (!sheetBtn || sheetBtn.__stepperAutoStatsWired) return;
    sheetBtn.__stepperAutoStatsWired = true;
    sheetBtn.addEventListener('click', () => {
      const synced = syncAutoCountsAndWalls(true);
      if (!synced) return;
      syncCountsWallsField('Counts', synced.counts, synced.autoCounts);
      syncCountsWallsField('Walls', synced.walls, synced.autoWalls);
    }, true);
  }

  function applyPreviewInlineFormatting(root){
    if (!root) return;
    const leafs = Array.from(root.querySelectorAll('p, div, span, h1, h2, h3, h4, li')).filter(node => node.children.length === 0);
    leafs.forEach((node) => {
      if (node.closest('#' + PREVIEW_NOTE_ID)) return;
      const rawText = node.textContent || '';
      if (!/(\*\*[^*]+\*\*|\/\*[^*]+\*\/|\*\/[^*]+\/\*|_[^_]+_)/.test(rawText)) return;
      let html = escapeHtml(rawText);
      html = html.replace(/\*\*([^*][\s\S]*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\/\*([\s\S]*?)\*\//g, '<em>$1</em>');
      html = html.replace(/\*\/([\s\S]*?)\/\*/g, '<em>$1</em>');
      html = html.replace(/_([^_][\s\S]*?)_/g, '<u>$1</u>');
      if (node.innerHTML !== html) node.innerHTML = html;
    });
  }

  function patchPreviewAutoHeaderValues(root, counts, walls){
    if (!root) return;
    const normalize = (value) => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    const isAutoValue = (value) => /^_*(?:AUTO|__AUTO__)_*$/.test(normalize(value).toUpperCase());
    const leafs = Array.from(root.querySelectorAll('p, div, span, h1, h2, h3, h4, strong')).filter((node) => node.children.length === 0 && !node.closest('#' + PREVIEW_NOTE_ID));

    leafs.forEach((node) => {
      const text = normalize(node.textContent || '');
      if (/^COUNT:?\s*_*(?:AUTO|__AUTO__)_*$/.test(text.toUpperCase())) node.textContent = `COUNT: ${counts}`;
      if (/^WALL:?\s*_*(?:AUTO|__AUTO__)_*$/.test(text.toUpperCase())) node.textContent = `WALL: ${walls}`;
    });

    const tryPatchSibling = (labelRegex, value) => {
      const labelNode = leafs.find((node) => labelRegex.test(normalize(node.textContent || '').toUpperCase()));
      if (!labelNode) return false;
      let sibling = labelNode.nextElementSibling;
      while (sibling) {
        const siblingText = normalize(sibling.textContent || '');
        if (isAutoValue(siblingText)) {
          sibling.textContent = String(value);
          return true;
        }
        if (siblingText) break;
        sibling = sibling.nextElementSibling;
      }
      return false;
    };

    const countPatched = tryPatchSibling(/^COUNT:?$/, counts);
    const wallPatched = tryPatchSibling(/^WALL:?$/, walls);

    if (!countPatched || !wallPatched) {
      const autoLeafs = leafs.filter((node) => isAutoValue(node.textContent || ''));
      if (!countPatched && autoLeafs[0]) autoLeafs[0].textContent = String(counts);
      if (!wallPatched && autoLeafs[1]) autoLeafs[1].textContent = String(walls);
    }
  }

  function patchPreviewSurface(){
    const main = document.querySelector('main');
    const synced = syncAutoCountsAndWalls(false);
    const data = synced && synced.data ? synced.data : readAppData();
    if (!main || !data) return;
    wireManualCountsAndWallsOverrides();
    const showingEditor = !!main.querySelector('input[placeholder="Section Title..."]');
    const note = document.getElementById(PREVIEW_NOTE_ID);
    if (showingEditor) {
      if (note) note.remove();
      return;
    }
    const counts = synced ? synced.counts : deriveCounts(data);
    const walls = synced ? synced.walls : deriveWalls(data);
    const level = levelDisplay(data);
    const sequence = deriveSequenceString(data);
    const leafs = Array.from(main.querySelectorAll('p, div, span, h1, h2, h3')).filter(node => node.children.length === 0);
    const statsLine = leafs.find(node => /Count:\s*/i.test((node.textContent || '').trim()) && /Wall:/i.test((node.textContent || '').trim()));
    if (statsLine) statsLine.textContent = `Count: ${counts} | Wall: ${walls} | Level: ${level}`;
    patchPreviewAutoHeaderValues(main, counts, walls);
    let previewNote = document.getElementById(PREVIEW_NOTE_ID);
    if (!previewNote) {
      previewNote = document.createElement('section');
      previewNote.id = PREVIEW_NOTE_ID;
      previewNote.className = `rounded-3xl border px-5 py-5 ${themeClasses().soft}`;
      const titleBlock = main.firstElementChild;
      if (titleBlock) main.insertBefore(previewNote, titleBlock.nextSibling || titleBlock);
      else main.prepend(previewNote);
    }
    previewNote.className = `rounded-3xl border px-5 py-5 ${themeClasses().soft}`;
    previewNote.innerHTML = `
      <div class="flex flex-wrap items-center gap-3">
        <span class="stepper-part-pill ${themeClasses().dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(normalizePhrasedTools(data).danceFormat === 'phrased' ? 'Phrased Dance' : 'Regular Dance')}</span>
        <span class="text-sm font-semibold ${themeClasses().subtle}">Auto Count ${escapeHtml(counts)} · Auto Wall ${escapeHtml(walls)}</span>
      </div>
      ${sequence ? `<p class="mt-3 text-sm leading-relaxed ${themeClasses().subtle}"><strong class="${themeClasses().dark ? 'text-neutral-100' : 'text-neutral-900'}">Sequence:</strong> ${escapeHtml(sequence)}</p>` : ''}
      ${normalizePhrasedTools(data).danceFormat === 'phrased' ? `<p class="mt-2 text-sm ${themeClasses().subtle}">Built in editable Parts and Sequence style, matching common phrased-sheet layout where A/B/C parts and Tags are sequenced separately.</p>` : ''}
    `;
    applyPreviewInlineFormatting(main);
    syncCountsWallsField('Counts', counts, synced ? synced.autoCounts : true);
    syncCountsWallsField('Walls', walls, synced ? synced.autoWalls : true);
  }

  function ensureMenu(){
    let menu = document.getElementById(MENU_ID);
    if (menu) return menu;
    menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.hidden = true;
    document.body.appendChild(menu);
    document.addEventListener('click', () => { menu.hidden = true; contextMenuState = null; });
    window.addEventListener('scroll', () => { menu.hidden = true; contextMenuState = null; }, true);
    return menu;
  }

  function showPartMenu(x, y, sectionId, sectionName){
    const menu = ensureMenu();
    contextMenuState = { sectionId, sectionName };
    const dark = isDarkMode();
    menu.className = dark ? 'bg-neutral-950 border border-neutral-800 text-neutral-100' : 'bg-white border border-neutral-200 text-neutral-900';
    menu.innerHTML = `<button type="button">Add Part from ${escapeHtml(sectionName || 'this section')}</button>`;
    menu.style.left = Math.max(12, x) + 'px';
    menu.style.top = Math.max(12, y) + 'px';
    menu.hidden = false;
    const button = menu.querySelector('button');
    if (button) button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (contextMenuState) addPartFromSection(contextMenuState.sectionId);
      menu.hidden = true;
      contextMenuState = null;
    }, { once:true });
  }

  function decorateSectionHeaders(){
    const main = document.querySelector('main');
    const data = readAppData();
    if (!main || !data) return;
    const sections = getMainSections(data);
    const inputs = Array.from(main.querySelectorAll('input[placeholder="Section Title..."]'));
    inputs.forEach((input, index) => {
      const header = input.parentElement;
      const section = sections[index];
      if (!header || !section) return;
      header.classList.add('stepper-section-header-partable');
      let button = header.querySelector('.stepper-section-part-btn');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'stepper-section-part-btn';
        button.textContent = 'Part';
        header.appendChild(button);
      }
      if (!button.__stepperPartButtonWired) {
        button.__stepperPartButtonWired = true;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          addPartFromSection(section.id);
        });
      }
    });
  }

  function injectWhatsNewNotes(){
    const ownPage = document.getElementById('stepper-whatsnew-page');
    if (!ownPage) return;
    const list = ownPage.querySelector('.p-6') || ownPage.querySelector('.space-y-5') || ownPage;
    EXTRA_NOTES.forEach((note, index) => {
      const id = `stepper-v2-note-${index}`;
      if (ownPage.querySelector('#' + id)) return;
      const theme = themeClasses();
      const noteEl = document.createElement('article');
      noteEl.id = id;
      noteEl.className = `rounded-2xl border px-4 py-4 flex gap-3 ${theme.soft}`;
      noteEl.innerHTML = `<div class="mt-0.5 shrink-0"><span class="stepper-panel-icon">${index % 2 === 0 ? iconSparkles() : iconShoe()}</span></div><p class="font-medium leading-relaxed">${escapeHtml(note)}</p>`;
      list.prepend(noteEl);
    });
  }

  function boot(){
    if (maybeRestoreSavedForLaterOnBoot()) return;
    ensureCustomStyles();
    applyFontSettings();
    ensureInlineHost();
    renderCustomPanels();
    decorateSectionHeaders();
    injectWhatsNewNotes();
    ensureHelpMenu();
    ensureEditorFormattingShortcuts();
    wirePreviewAutoStats();

    let queued = false;
    const refresh = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        applyFontSettings();
        renderCustomPanels();
        decorateSectionHeaders();
        injectWhatsNewNotes();
        ensureHelpMenu();
        wirePreviewAutoStats();
      });
    };

    const mutationIsFromStepperEnhancements = (mutation) => {
      const nodes = [mutation.target, ...(mutation.addedNodes || []), ...(mutation.removedNodes || [])];
      return nodes.every((node) => {
        const el = node && node.nodeType === 1 ? node : (node && node.parentElement ? node.parentElement : null);
        if (!el) return true;
        return !!el.closest(
          '#' + PREVIEW_NOTE_ID +
          ', #' + INLINE_HOST_ID +
          ', #' + MENU_ID +
          ', .stepper-section-header-partable' +
          ', .stepper-section-part-btn'
        );
      });
    };

    const main = document.querySelector('main');
    if (main && !main.__stepperObserver) {
      main.__stepperObserver = new MutationObserver((mutations) => {
        if (!mutations.some((mutation) => !mutationIsFromStepperEnhancements(mutation))) return;
        refresh();
      });
      main.__stepperObserver.observe(main, { childList:true, subtree:true });
    }

    setInterval(() => {
      saveFeaturedSnapshot();
      patchPreviewSurface();
    }, 4200);
    window.addEventListener('storage', refresh);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
