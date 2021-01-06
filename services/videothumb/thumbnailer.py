from cv2 import imwrite, resize, VideoCapture
from sys import argv
from os.path import basename, isfile

if not isfile(argv[1]):
    print('File not found: %s' % argv[1])
    exit(1)

infile = argv[1]
outprefix = argv[2]
vid = VideoCapture(infile)

infile = outprefix + '/' + basename(infile)

_, frame = vid.read()

size = frame.shape[:2]
aspect_ratio = min(size[0], size[1]) / max(size[0], size[1])
is_tall = size[1] > size[0]

# Full image
def scale_image(isize):
    new_size = (isize, int(isize * aspect_ratio)) if is_tall else (int(isize * aspect_ratio), isize)
    thumb = resize(frame, new_size)
    imwrite('%s.full.%s.jpg' % (infile, isize), thumb)

# Square
offset = (0, size[1] - size[0]) if is_tall else (size[0] - size[1], 0)
offset = [int(x / 2) for x in offset]
new_width = min(size[0], size[1])
square = frame[offset[0]:offset[0] + new_width, offset[1]:offset[1] + new_width]

def scale_image_square(isize):
    global square, infile
    square = resize(square, (isize, isize))
    imwrite('%s.square.%s.jpg' % (infile, isize), square)

scale_image(960)
scale_image(640)
scale_image(256)
scale_image(128)
scale_image(64)

scale_image_square(960)
scale_image_square(640)
scale_image_square(256)
scale_image_square(128)
scale_image_square(64)

vid.release()
