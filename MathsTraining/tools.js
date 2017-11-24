function GCDsub(a, b) {
	var modulo = a%b;
	if (!modulo)
		return b;
	if (modulo == 1)
		return 1;
	return GCD(b, modulo);
}

function GCD(a, b) {
	if (a < b) {
		return GCDsub(b, a);
	} else if (a > b) {
		return GCDsub(a, b);
	}
	return a;
}
